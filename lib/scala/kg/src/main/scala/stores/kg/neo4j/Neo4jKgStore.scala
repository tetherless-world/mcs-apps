package stores.kg.neo4j

import com.google.inject.Inject
import formats.kg.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import javax.inject.Singleton
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import org.neo4j.driver._
import org.slf4j.LoggerFactory
import stores.kg.{KgNodeFilters, KgStore}
import stores.{Neo4jStoreConfiguration, StringFilter}

import scala.collection.JavaConverters._
import scala.collection.mutable

final case class CypherBinding(variableName: String, value: Any)

final case class CypherFilter(cypher: String, binding: Option[CypherBinding] = None)

final case class CypherFilters(filters: List[CypherFilter]) {
  def toCypherBindingsMap: Map[String, Any] =
    filters.flatMap(filter => filter.binding).map(binding => (binding.variableName -> binding.value)).toMap

  def toCypherString: String =
    if (!filters.isEmpty) {
      s"WHERE ${filters.map(filter => filter.cypher).mkString(" AND ")}"
    } else {
      ""
    }
}

object CypherFilters {
  def apply(nodeFilters: Option[KgNodeFilters]): CypherFilters =
    if (nodeFilters.isDefined) {
      apply(nodeFilters.get)
    } else {
      CypherFilters(List())
    }

  def apply(nodeFilters: KgNodeFilters): CypherFilters =
    if (nodeFilters.sources.isDefined) {
      CypherFilters(toCypherFilters(bindingVariableNamePrefix = "nodeSource", property = "node.sources", stringFilter = nodeFilters.sources.get))
    } else {
      CypherFilters(List())
    }

  private def toCypherFilters(bindingVariableNamePrefix: String, property: String, stringFilter: StringFilter): List[CypherFilter] = {
    stringFilter.exclude.getOrElse(List()).zipWithIndex.map(excludeWithIndex => {
      val bindingVariableName = s"${bindingVariableNamePrefix}Exclude${excludeWithIndex._2}"
      CypherFilter(binding = Some(CypherBinding(variableName = bindingVariableName, value = excludeWithIndex._1)), cypher = s"NOT ${property} = $$${bindingVariableName}")
    }) ++
      stringFilter.include.getOrElse(List()).zipWithIndex.map(includeWithIndex => {
        val bindingVariableName = s"${bindingVariableNamePrefix}Include${includeWithIndex._2}"
        CypherFilter(binding = Some(CypherBinding(variableName = bindingVariableName, value = includeWithIndex._1)), cypher = s"${property} = $$${bindingVariableName}")
      })
  }
}

final case class PathRecord(
                             sources: List[String],
                             objectNodeId: String,
                             pathEdgeIndex: Int,
                             pathEdgePredicate: String,
                             pathId: String,
                             subjectNodeId: String
                           ) {
  def toEdge: KgEdge =
    KgEdge(
      id = s"${pathId}-${pathEdgeIndex}",
      labels = List(),
      `object` = objectNodeId,
      origins = List(),
      questions = List(),
      predicate = pathEdgePredicate,
      sentences = List(),
      sources = sources,
      subject = subjectNodeId,
      weight = None
    )
}

@Singleton
final class Neo4jKgStore @Inject()(configuration: Neo4jStoreConfiguration) extends KgStore with WithResource {
  private var bootstrapped: Boolean = false
  private val driver = GraphDatabase.driver(configuration.uri, AuthTokens.basic(configuration.user, configuration.password))
  private val edgePropertyNameList = List("id", "labels", "object", "origins", "questions", "sentences", "sources", "subject", "weight")
  private val edgePropertyNamesString = edgePropertyNameList.map(edgePropertyName => "edge." + edgePropertyName).mkString(", ")
  protected final val ListDelimChar = '|'
  protected final val ListDelimString = ListDelimChar.toString
  private val logger = LoggerFactory.getLogger(getClass)
  private val nodePropertyNameList = List("id", "labels", "pos", "sources")
  private val nodePropertyNamesString = nodePropertyNameList.map(nodePropertyName => "node." + nodePropertyName).mkString(", ")
  private val pathPropertyNameList = List("id", "objectNode", "pathEdgeIndex", "pathEdgePredicate", "sources", "subjectNode")
  private val pathPropertyNamesString = pathPropertyNameList.map(pathPropertyName => "path." + pathPropertyName).mkString(", ")

  private implicit class RecordWrapper(record: Record) {
    private def toList(value: String): List[String] = {
      if (value.isEmpty) {
        List()
      } else {
        value.split(ListDelimChar).toList
      }
    }

    def toEdge: KgEdge = {
      val recordMap = record.asMap().asScala.toMap
      KgEdge(
        id = recordMap("edge.id").asInstanceOf[String],
        labels = toList(recordMap("edge.labels").asInstanceOf[String]),
        `object` = recordMap("object.id").asInstanceOf[String],
        origins = toList(recordMap("edge.origins").asInstanceOf[String]),
        questions = toList(recordMap("edge.questions").asInstanceOf[String]),
        sentences = toList(recordMap("edge.sentences").asInstanceOf[String]),
        predicate = recordMap("type(edge)").asInstanceOf[String],
        sources = toList(recordMap("edge.sources").asInstanceOf[String]),
        subject = recordMap("subject.id").asInstanceOf[String],
        weight = Option(recordMap("edge.weight")).map(weight => weight.asInstanceOf[Double].doubleValue())
      )
    }

    def toNode: KgNode = {
      val recordMap = record.asMap().asScala.toMap.asInstanceOf[Map[String, String]]
      KgNode(
        id = recordMap("node.id"),
        labels = toList(recordMap("node.labels")),
        pos = Option(recordMap("node.pos")),
        sources = toList(recordMap("node.sources"))
      )
    }

    def toPathRecord: PathRecord = {
      PathRecord(
        objectNodeId = record.get("objectNode.id").asString(),
        pathId = record.get("path.id").asString(),
        pathEdgeIndex = record.get("path.pathEdgeIndex").asInt(),
        pathEdgePredicate = record.get("path.pathEdgePredicate").asString(),
        sources = record.get("path.sources").asString().split(ListDelimChar).toList,
        subjectNodeId = record.get("subjectNode.id").asString()
      )
    }
  }

  private implicit class ResultsWrapper(result: Result) {
    def toEdges: List[KgEdge] =
      result.asScala.toList.map(record => record.toEdge)

    def toNodes: List[KgNode] =
      result.asScala.toList.map(record => record.toNode)

    def toPaths: List[KgPath] = {
      result.asScala.toList.map(record => record.toPathRecord).groupBy(pathRecord => pathRecord.pathId).map(pathRecordsEntry =>
        pathRecordsEntry match {
          case (pathId, pathRecords) =>
            KgPath(
              edges = pathRecords.sortBy(pathRecord => pathRecord.pathEdgeIndex).map(pathRecord => pathRecord.toEdge),
              id = pathId,
              sources = pathRecords(0).sources,
            )
        }
      ).toList
    }
  }

  final implicit class Neo4jKgStoreTransaction(transaction: Transaction) extends KgStore {
    final def clear(): Unit =
    // https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/
      transaction.run(
        """CALL apoc.periodic.iterate("MATCH (n) return n", "DETACH DELETE n", {batchSize:1000})
          |YIELD batches, total
          |RETURN batches, total
          |""".stripMargin)

    final override def getSourcesById: Map[String, KgSource] =
      transaction.run("MATCH (source:Source) RETURN source.id, source.label").asScala.map(record =>
        KgSource(
          id = record.get("source.id").asString(),
          label = record.get("source.label").asString()
        )
      ).map(source => (source.id, source)).toMap

    final override def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge] =
      transaction.run(
        s"""
           |MATCH (subject:Node)-[edge]->(object:Node {id: $$objectNodeId})
           |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
           |ORDER BY type(edge), subject.id, edge
           |SKIP ${offset}
           |LIMIT ${limit}
           |""".stripMargin,
        toTransactionRunParameters(Map(
          "objectNodeId" -> objectNodeId
        ))
      ).toEdges

    final override def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge] =
      transaction.run(
        s"""
           |MATCH (subject:Node {id: $$subjectNodeId})-[edge]->(object:Node)
           |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
           |ORDER BY type(edge), object.id, edge
           |SKIP ${offset}
           |LIMIT ${limit}
           |""".stripMargin,
        toTransactionRunParameters(Map(
          "subjectNodeId" -> subjectNodeId
        ))
      ).toEdges

    final override def getMatchingNodes(filters: Option[KgNodeFilters], limit: Int, offset: Int, text: Option[String]): List[KgNode] = {
      val cypherFilters = CypherFilters(filters)
      transaction.run(
        s"""${textMatchToCypherMatch(text)}
           |${cypherFilters.toCypherString}
           |RETURN ${nodePropertyNamesString}
           |SKIP ${offset}
           |LIMIT ${limit}
           |""".stripMargin,
        toTransactionRunParameters(textMatchToCypherBindingsMap(text) ++ cypherFilters.toCypherBindingsMap)
      ).toNodes
    }

    final override def getMatchingNodesCount(filters: Option[KgNodeFilters], text: Option[String]): Int = {
      val cypherFilters = CypherFilters(filters)
      val result =
        transaction.run(
          s"""${textMatchToCypherMatch(text)}
             |${cypherFilters.toCypherString}
             |RETURN COUNT(node)
             |""".stripMargin,
          toTransactionRunParameters(textMatchToCypherBindingsMap(text) ++ cypherFilters.toCypherBindingsMap)
        )
      val record = result.single()
      record.get("COUNT(node)").asInt()
    }

    final override def getNodeById(id: String): Option[KgNode] =
      transaction.run(
        s"MATCH (node:Node {id: $$id}) RETURN ${nodePropertyNamesString};",
        toTransactionRunParameters(Map("id" -> id))
      ).toNodes.headOption

    final override def getPathById(id: String): Option[KgPath] =
      transaction.run(
        s"""MATCH (subjectNode:Node)-[path:PATH {id: $$id}]->(objectNode:Node)
           |RETURN objectNode.id, subjectNode.id, ${pathPropertyNamesString}
           |""".stripMargin,
        toTransactionRunParameters(Map("id" -> id))
      ).toPaths.headOption

    final override def getRandomNode: KgNode =
      transaction.run(
        s"MATCH (node:Node) RETURN ${nodePropertyNamesString}, rand() as rand ORDER BY rand ASC LIMIT 1"
      ).toNodes.head

    final override def getTotalEdgesCount: Int =
      transaction.run(
        """
          |MATCH (subject:Node)-[r]->(object:Node)
          |WHERE NOT type(r) = "PATH"
          |RETURN COUNT(r) as count
          |""".stripMargin
      ).single().get("count").asInt()

    final override def getTotalNodesCount: Int =
      transaction.run("MATCH (n:Node) RETURN COUNT(n) as count").single().get("count").asInt()

    final override def isEmpty: Boolean =
      transaction.run("MATCH (n) RETURN COUNT(n) as count").single().get("count").asInt() == 0

    final def putEdge(edge: KgEdge) =
      transaction.run(
        """MATCH (subject:Node {id: $subject}), (object:Node {id: $object})
          |CALL apoc.create.relationship(subject, $predicate, {id: $id, labels: $labels, origins: $origins, questions: $questions, sentences: $sentences, sources: $sources, weight: toFloat($weight)}, object) YIELD rel
          |REMOVE rel.noOp
          |""".stripMargin,
        toTransactionRunParameters(Map(
          "id" -> edge.id,
          "labels" -> edge.labels.mkString(ListDelimString),
          "object" -> edge.`object`,
          "origins" -> edge.origins.mkString(ListDelimString),
          "questions" -> edge.questions.mkString(ListDelimString),
          "predicate" -> edge.predicate,
          "sentences" -> edge.sentences.mkString(ListDelimString),
          "sources" -> edge.sources.mkString(ListDelimString),
          "subject" -> edge.subject,
          "weight" -> edge.weight.getOrElse(null)
        ))
      )

    final override def putEdges(edges: Iterator[KgEdge]): Unit = {
      putModelsBatched(edges) { edges => {
        putSources(edges.flatMap(_.sources).distinct.map(KgSource(_)))
        for (edge <- edges) {
          putEdge(edge)
        }
      }
      }
    }

    final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit = {
      // Neo4j doesn't tolerate duplicate nodes
      val putNodeIds = new mutable.HashSet[String]
      putModelsBatched(edgesWithNodes) { edgesWithNodes => {
        putSources(edgesWithNodes.flatMap(_.sources).distinct.map(KgSource(_)))
        for (edgeWithNodes <- edgesWithNodes) {
          if (putNodeIds.add(edgeWithNodes.node1.id)) {
            putNode(edgeWithNodes.node1)
          }
          if (putNodeIds.add(edgeWithNodes.node2.id)) {
            putNode(edgeWithNodes.node2)
          }
          putEdge(edgeWithNodes.edge)
        }
      }
      }
    }

    private def putModelsBatched[ModelT](models: Iterator[ModelT])(putModelBatch: (List[ModelT]) => Unit): Unit =
      withSession { session => {
        // Batch the models in order to put them all in a transaction.
        // My (MG) first implementation looked like:
        //      for (modelWithIndex <- models.zipWithIndex) {
        //        val (model, modelIndex) = modelWithIndex
        //        putModel(transaction, model)
        //        if (modelIndex > 0 && (modelIndex + 1) % PutCommitInterval == 0) {
        //          tryOperation(() => transaction.commit())
        //          transaction = session.beginTransaction()
        //        }
        //      }
        // tryOperation handled TransientException, but the first transaction always failed and was rolled back.
        // I don't have time to investigate that. Batching models should be OK for now.
        val modelBatch = new mutable.MutableList[ModelT]
        while (models.hasNext) {
          while (modelBatch.size < configuration.commitInterval && models.hasNext) {
            modelBatch += models.next()
          }
          if (!modelBatch.isEmpty) {
            //          logger.info("putting batch of {} models in a transaction", modelBatch.size)
            putModelBatch(modelBatch.toList)
            modelBatch.clear()
          }
        }
      }
      }

    final def putNode(node: KgNode): Unit = {
      transaction.run(
        "CREATE (:Node { id: $id, labels: $labels, pos: $pos, sources: $sources });",
        toTransactionRunParameters(Map(
          "id" -> node.id,
          "labels" -> node.labels.mkString(ListDelimString),
          "pos" -> node.pos.getOrElse(null),
          "sources" -> node.sources.mkString(ListDelimString),
        ))
      )
    }

    final override def putNodes(nodes: Iterator[KgNode]): Unit =
      putModelsBatched(nodes) { nodes => {
        putSources(nodes.flatMap(_.sources).distinct.map(KgSource(_)))
        for (node <- nodes) {
          putNode(node)
        }
      }
      }

    final override def putPaths(paths: Iterator[KgPath]): Unit =
      putModelsBatched(paths) { paths => {
        for (path <- paths) {
          for (pathEdgeWithIndex <- path.edges.zipWithIndex) {
            val (pathEdge, pathEdgeIndex) = pathEdgeWithIndex
            transaction.run(
              """
                |MATCH (subject:Node), (object: Node)
                |WHERE subject.id = $subject AND object.id = $object
                |CREATE (subject)-[path:PATH {id: $pathId, pathEdgeIndex: $pathEdgeIndex, pathEdgePredicate: $pathEdgePredicate, sources: $sources}]->(object)
                |""".stripMargin,
              toTransactionRunParameters(Map(
                "object" -> pathEdge.`object`,
                "pathEdgeIndex" -> pathEdgeIndex,
                "pathEdgePredicate" -> pathEdge.predicate,
                "pathId" -> path.id,
                "sources" -> path.sources.mkString(ListDelimString),
                "subject" -> pathEdge.subject
              ))
            )
          }
        }
      }
      }

    final override def putSources(sources: Iterator[KgSource]): Unit =
      for (source <- sources) {
        val transactionRunParameters = toTransactionRunParameters(Map("id" -> source.id, "label" -> source.label))
        val sourceExists =
          transaction.run(
            """
              |MATCH (source:Source)
              |WHERE source.id = $id
              |RETURN source.label
              |LIMIT 1
              |""".stripMargin,
            transactionRunParameters
          ).hasNext
        if (!sourceExists) {
          transaction.run("CREATE (:Source { id: $id, label: $label });", transactionRunParameters)
          logger.info("created source {}", source.id)
        } else {
          logger.info(s"source {} already exists", source.id)
        }
      }

    private def textMatchToCypherBindingsMap(text: Option[String]) =
      if (text.isDefined) {
        Map(
          "text" -> text.get
        )
      } else {
        Map()
      }

    private def textMatchToCypherMatch(text: Option[String]) =
      if (text.isDefined) {
        s"""CALL db.index.fulltext.queryNodes("node", $$text) YIELD node, score"""
      } else {
        "MATCH (node: Node)"
      }

    private def toTransactionRunParameters(map: Map[String, Any]) =
      map.asJava.asInstanceOf[java.util.Map[String, Object]]
  }

  bootstrapStore()

  private def bootstrapStore(): Unit = {
    this.synchronized {
      if (bootstrapped) {
        return
      }

      withSession { session =>
        val hasConstraints =
          session.readTransaction { transaction =>
            val result =
              transaction.run("CALL db.constraints")
            result.hasNext
          }

        if (hasConstraints) {
          logger.info("neo4j indices already exist")
          bootstrapped = true
          return
        }

        logger.info("bootstrapping neo4j indices")

        val bootstrapCypherStatements = List(
          """CALL db.index.fulltext.createNodeIndex("node",["Node"],["id", "labels", "sources"]);""",
          """CREATE CONSTRAINT node_id_constraint ON (node:Node) ASSERT node.id IS UNIQUE;""",
          """CREATE CONSTRAINT source_id_constraint ON (source:Source) ASSERT source.id IS UNIQUE;"""
        )

        session.writeTransaction { transaction =>
          for (bootstrapCypherStatement <- bootstrapCypherStatements) {
            transaction.run(bootstrapCypherStatement)
          }
          transaction.commit()
        }
      }

      logger.info("bootstrapped neo4j indices")
    }
  }

  final def clear(): Unit = {
    // It would be simpler to use CREATE OR REPLACE DATABASE, but the free Neo4j 4.0 Community Edition doesn't support it,
    // and the open source fork of the Neo4j Enterprise Edition doesn't include 4.0 features yet.
    withWriteTransaction { transaction =>
      transaction.clear()
      transaction.commit()
    }
    while (!isEmpty) {
      logger.info("waiting for neo4j to clear")
      Thread.sleep(100)
    }
  }

  final override def getSourcesById: Map[String, KgSource] =
    withReadTransaction { transaction =>
      transaction.getSourcesById
    }

  override final def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge] =
    withReadTransaction { transaction =>
      transaction.getEdgesByObject(limit, objectNodeId, offset)
    }

  override final def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge] =
    withReadTransaction { transaction =>
      transaction.getEdgesBySubject(limit, offset, subjectNodeId)
    }

  final override def getMatchingNodes(filters: Option[KgNodeFilters], limit: Int, offset: Int, text: Option[String]): List[KgNode] =
    withReadTransaction { transaction =>
      transaction.getMatchingNodes(filters, limit, offset, text)
    }

  final override def getMatchingNodesCount(filters: Option[KgNodeFilters], text: Option[String]): Int =
    withReadTransaction { transaction =>
      transaction.getMatchingNodesCount(filters, text)
    }

  override final def getNodeById(id: String): Option[KgNode] =
    withReadTransaction { transaction =>
      transaction.getNodeById(id)
    }

  //  override def getPaths: List[KgPath] =
  //    withSession { session =>
  //      session.readTransaction { transaction =>
  //        transaction.run(
  //          s"""MATCH (subjectNode:Node)-[path:PATH]->(objectNode:Node)
  //            |RETURN objectNode.id, subjectNode.id, ${pathPropertyNamesString}
  //            |""".stripMargin
  //        ).toPaths
  //      }
  //    }
  //
  override def getPathById(id: String): Option[KgPath] =
    withReadTransaction { transaction =>
      transaction.getPathById(id)
    }

  final override def getRandomNode: KgNode =
    withReadTransaction { transaction =>
      transaction.getRandomNode
    }

  final override def getTotalEdgesCount: Int =
    withReadTransaction { transaction =>
      transaction.getTotalEdgesCount
    }

  final override def getTotalNodesCount: Int =
    withReadTransaction { transaction =>
      transaction.getTotalNodesCount
    }

  final override def isEmpty: Boolean =
    withReadTransaction { transaction =>
      transaction.isEmpty
    }

  final override def putEdges(edges: Iterator[KgEdge]): Unit =
    withWriteTransaction { transaction =>
      transaction.putEdges(edges)
    }

  final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit =
    withWriteTransaction { transaction =>
      transaction.putKgtkEdgesWithNodes(edgesWithNodes)
    }

  final override def putNodes(nodes: Iterator[KgNode]): Unit =
    withWriteTransaction { transaction =>
      transaction.putNodes(nodes)
    }

  final override def putPaths(paths: Iterator[KgPath]): Unit =
    withWriteTransaction { transaction =>
      transaction.putPaths(paths)
    }

  final override def putSources(sources: Iterator[KgSource]): Unit =
    withWriteTransaction { transaction =>
      transaction.putSources(sources)
    }

  private def withReadTransaction[V](f: Transaction => V): V =
    withSession { session => {
      session.readTransaction { transaction =>
        f(transaction)
      }
    }
    }

  private def withSession[V](f: Session => V): V =
    withResource[Session, V](driver.session())(f)

  private def withWriteTransaction[V](f: Transaction => V): V =
    withSession { session => {
      session.writeTransaction { transaction =>
        f(transaction)
      }
    }
    }
}
