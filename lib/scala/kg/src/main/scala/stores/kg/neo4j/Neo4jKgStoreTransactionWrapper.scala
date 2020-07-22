package stores.kg.neo4j

import formats.kg.kgtk.KgtkEdgeWithNodes
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import org.neo4j.driver.{Result, Transaction}
import org.slf4j.LoggerFactory
import stores.Neo4jStoreConfiguration
import stores.kg.{KgNodeFilters, KgStore}

import scala.collection.mutable
import scala.collection.JavaConverters._

class Neo4jKgStoreTransactionWrapper(configuration: Neo4jStoreConfiguration, transaction: Transaction) extends KgStore {
  private val edgePropertyNameList = List("id", "labels", "object", "origins", "questions", "sentences", "sources", "subject", "weight")
  private val edgePropertyNamesString = edgePropertyNameList.map(edgePropertyName => "edge." + edgePropertyName).mkString(", ")
  private val ListDelimString = Neo4jKgStore.ListDelimChar.toString
  private val logger = LoggerFactory.getLogger(getClass)
  private val nodePropertyNameList = List("id", "labels", "pos", "sources")
  private val nodePropertyNamesString = nodePropertyNameList.map(nodePropertyName => "node." + nodePropertyName).mkString(", ")
  private val pathPropertyNameList = List("id", "objectNode", "pathEdgeIndex", "pathEdgePredicate", "sources", "subjectNode")
  private val pathPropertyNamesString = pathPropertyNameList.map(pathPropertyName => "path." + pathPropertyName).mkString(", ")

  private implicit class Neo4jKgStoreResultWrapperImplicit(result: Result) extends Neo4jKgStoreResultWrapper(result)

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

  private def putModelsBatched[ModelT](models: Iterator[ModelT])(putModelBatch: (List[ModelT]) => Unit): Unit = {
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
