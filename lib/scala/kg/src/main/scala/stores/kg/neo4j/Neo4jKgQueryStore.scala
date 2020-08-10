package stores.kg.neo4j

import com.google.inject.Inject
import javax.inject.Singleton
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import org.neo4j.driver._
import stores.Neo4jStoreConfiguration
import stores.kg.{KgNodeFacets, KgNodeFilters, KgNodeQuery, KgNodeSort, KgQueryStore}

import scala.collection.JavaConverters._
import scala.util.Try

@Singleton
final class Neo4jKgQueryStore @Inject()(configuration: Neo4jStoreConfiguration) extends AbstractNeo4jKgStore(configuration) with KgQueryStore {
  private final implicit class RecordWrapper(record: Record) {
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
        predicate = recordMap("type(edge)").asInstanceOf[String],
        sentences = toList(recordMap("edge.sentences").asInstanceOf[String]),
        sources = toList(recordMap("edge.sources").asInstanceOf[String]),
        subject = recordMap("subject.id").asInstanceOf[String]
      )
    }

    def toNode: KgNode = {
      val recordMap = record.asMap().asScala.toMap
      KgNode(
        id = recordMap("node.id").asInstanceOf[String],
        labels = toList(recordMap("node.labels").asInstanceOf[String]),
        pageRank = Try(recordMap("node.pageRank").asInstanceOf[Double].doubleValue()).toOption,
        pos = Option(recordMap("node.pos")).map(_.asInstanceOf[String]),
        sourceIds = toList(recordMap("node.sources").asInstanceOf[String])
      )
    }

    def toPathRecord: Neo4jKgPathRecord = {
      Neo4jKgPathRecord(
        objectNodeId = record.get("objectNode.id").asString(),
        pathId = record.get("path.id").asString(),
        pathEdgeIndex = record.get("path.pathEdgeIndex").asInt(),
        pathEdgePredicate = record.get("path.pathEdgePredicate").asString(),
        sources = record.get("path.sources").asString().split(ListDelimChar).toList,
        subjectNodeId = record.get("subjectNode.id").asString()
      )
    }

    def toSource: KgSource = {
      val recordMap = record.asMap().asScala.toMap
      KgSource(
        id = recordMap("source.id").asInstanceOf[String],
        label = recordMap("source.label").asInstanceOf[String]
      )
    }
  }

  private final implicit class ResultWrapper(result: Result) {
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

  private final implicit class TransactionWrapper(transaction: Transaction) extends KgQueryStore {
    private val edgePropertyNameList = List("id", "labels", "object", "sentences", "sources", "subject")
    private val edgePropertyNamesString = edgePropertyNameList.map(edgePropertyName => "edge." + edgePropertyName).mkString(", ")
    private val nodePropertyNameList = List("id", "labels", "pos", "sources", "pageRank")
    private val nodePropertyNamesString = nodePropertyNameList.map(nodePropertyName => "node." + nodePropertyName).mkString(", ")
    private val pathPropertyNameList = List("id", "objectNode", "pathEdgeIndex", "pathEdgePredicate", "sources", "subjectNode")
    private val pathPropertyNamesString = pathPropertyNameList.map(pathPropertyName => "path." + pathPropertyName).mkString(", ")

    final def clear(): Unit =
    // https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/
      transaction.run(
        """CALL apoc.periodic.iterate("MATCH (n) return n", "DETACH DELETE n", {batchSize:1000})
          |YIELD batches, total
          |RETURN batches, total
          |""".stripMargin)

    final override def getSourcesById: Map[String, KgSource] =
      transaction.run(s"MATCH (source:${SourceLabel}) RETURN source.id, source.label").asScala.map(record =>
        KgSource(
          id = record.get("source.id").asString(),
          label = record.get("source.label").asString()
        )
      ).map(source => (source.id, source)).toMap

    final override def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge] =
      transaction.run(
        s"""
           |MATCH (subject:${NodeLabel})-[edge]->(object:${NodeLabel} {id: $$objectNodeId})
           |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
           |ORDER BY type(edge), subject.pageRank, edge
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
           |MATCH (subject:${NodeLabel} {id: $$subjectNodeId})-[edge]->(object:${NodeLabel})
           |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
           |ORDER BY type(edge), object.pageRank, edge
           |SKIP ${offset}
           |LIMIT ${limit}
           |""".stripMargin,
        toTransactionRunParameters(Map(
          "subjectNodeId" -> subjectNodeId
        ))
      ).toEdges

    final override def getMatchingNodeFacets(query: KgNodeQuery): KgNodeFacets = {
      val cypher = KgNodeQueryCypher(query)

      // Get sources
      val sources =
        transaction.run(
          s"""
             |${cypher.fulltextCall.getOrElse("")}
             |MATCH ${(cypher.matchClauses ++ List(s"(node)-[:${SourceRelationshipType}]->(source:${SourceLabel})")).mkString(", ")}
             |${if (cypher.whereClauses.nonEmpty) "WHERE " + cypher.whereClauses.mkString(" AND ") else ""}
             |RETURN DISTINCT source.id, source.label
             |""".stripMargin,
          toTransactionRunParameters(cypher.bindings)
        ).asScala.map(record => record.toSource).toSet.toList

      KgNodeFacets(
        sources = sources
      )
    }


    final override def getMatchingNodes(limit: Int, offset: Int, query: KgNodeQuery, sorts: Option[List[KgNodeSort]]): List[KgNode] = {
      val cypher = KgNodeQueryCypher(query)
      transaction.run(
        (List(cypher) ++ List(s"RETURN ${nodePropertyNamesString}") ++ (if (sorts.nonEmpty) List(s"ORDER by ${sorts.get.map(sort => s"${sort.field.toString} ${sort.direction.toString}").mkString(", ")}") else List()) ++ List(s"SKIP ${offset}") ++ List(s"LIMIT ${limit}")).mkString("\n"),
        toTransactionRunParameters(cypher.bindings)
      ).toNodes
    }

    final override def getMatchingNodesCount(query: KgNodeQuery): Int = {
      val cypher = KgNodeQueryCypher(query)
      val result =
        transaction.run(
          s"""${cypher}
             |RETURN COUNT(node)
             |""".stripMargin,
          toTransactionRunParameters(cypher.bindings)
        )
      val record = result.single()
      record.get("COUNT(node)").asInt()
    }

    final override def getNodeById(id: String): Option[KgNode] =
      transaction.run(
        s"MATCH (node:${NodeLabel} {id: $$id}) RETURN ${nodePropertyNamesString};",
        toTransactionRunParameters(Map("id" -> id))
      ).toNodes.headOption

    final override def getPathById(id: String): Option[KgPath] =
      transaction.run(
        s"""MATCH (subjectNode:${NodeLabel})-[path:${PathRelationshipType} {id: $$id}]->(objectNode:${NodeLabel})
           |RETURN objectNode.id, subjectNode.id, ${pathPropertyNamesString}
           |""".stripMargin,
        toTransactionRunParameters(Map("id" -> id))
      ).toPaths.headOption

    final override def getRandomNode: KgNode =
      transaction.run(
        s"MATCH (node:${NodeLabel}) RETURN ${nodePropertyNamesString}, rand() as rand ORDER BY rand ASC LIMIT 1"
      ).toNodes.head

    /**
     * Get top edges using pageRank grouped by relation that have the given node ID as an object
     */
    final override def getTopEdgesByObject(limit: Int, objectNodeId: String): List[KgEdge] = {
      transaction.run(
        s"""
           |MATCH (subject:${NodeLabel})-[edge]->(object:${NodeLabel} {id: $$objectNodeId})
           |WHERE type(edge)<>"${PathRelationshipType}"
           |WITH edge, subject, object
           |ORDER BY subject.pageRank DESC
           |WITH type(edge) as relation, collect([edge, subject, object])[0 .. ${limit}] as groupByRelation
           |UNWIND groupByRelation as group
           |WITH group[0] as edge, group[1] as subject, group[2] as object
           |RETURN type(edge), subject.id, object.id, ${edgePropertyNamesString}
           |""".stripMargin,
        toTransactionRunParameters(Map(
          "objectNodeId" -> objectNodeId
        ))
      ).toEdges
    }

    /**
     * Get top edges using pageRank grouped by relation that have the given node ID as a subject
     */
    final override def getTopEdgesBySubject(limit: Int, subjectNodeId: String): List[KgEdge] = {
      transaction.run(
        s"""
           |MATCH (subject:${NodeLabel} {id: $$subjectNodeId})-[edge]->(object:${NodeLabel})
           |WHERE type(edge)<>"${PathRelationshipType}"
           |WITH edge, subject, object
           |ORDER BY object.pageRank DESC
           |WITH type(edge) as relation, collect([edge, subject, object])[0 .. ${limit}] as groupByRelation
           |UNWIND groupByRelation as group
           |WITH group[0] as edge, group[1] as subject, group[2] as object
           |RETURN type(edge), subject.id, object.id, ${edgePropertyNamesString}
           |""".stripMargin,
        toTransactionRunParameters(Map(
          "subjectNodeId" -> subjectNodeId
        ))
      ).toEdges
    }

    final override def getTotalEdgesCount: Int =
      transaction.run(
        s"""
           |MATCH (subject:${NodeLabel})-[r]->(object:${NodeLabel})
           |WHERE NOT type(r) = "${PathRelationshipType}"
           |RETURN COUNT(r) as count
           |""".stripMargin
      ).single().get("count").asInt()

    final override def getTotalNodesCount: Int =
      transaction.run(s"MATCH (n:${NodeLabel}) RETURN COUNT(n) as count").single().get("count").asInt()

    final override def isEmpty: Boolean =
      transaction.run("MATCH (n) RETURN COUNT(n) as count").single().get("count").asInt() == 0

    private final case class KgNodeQueryCypher(
                                                bindings: Map[String, Any],
                                                fulltextCall: Option[String],
                                                matchClauses: List[String],
                                                whereClauses: List[String]
                                              ) {
      final override def toString =
        (fulltextCall.toList ++
          List("MATCH " + matchClauses.mkString(", ")) ++
          (if (whereClauses.nonEmpty) List("WHERE " + whereClauses.mkString(" AND ")) else List())).mkString("\n")
    }

    private object KgNodeQueryCypher {
      def apply(query: KgNodeQuery): KgNodeQueryCypher = {
        // Do this in an semi-imperative way but with immutable data structures and vals. It makes the code more readable.

        val fulltextCall = query.text.map(text =>
          """CALL db.index.fulltext.queryNodes("node", $text) YIELD node, score""")
        val textBindings = query.text.map("text" -> _).toList

        val distinctSourceIds =
          if (query.filters.isDefined && query.filters.get.sourceIds.isDefined) {
            query.filters.get.sourceIds.get.exclude.getOrElse(List()) ++ query.filters.get.sourceIds.get.include.getOrElse(List())
          } else {
            List()
          }.distinct

        val distinctSourceIdBindings = distinctSourceIds.zipWithIndex.map(sourceIdWithIndex => s"source${sourceIdWithIndex._2}" -> sourceIdWithIndex._1)

        val matchClauses: List[String] = List(s"(node: ${NodeLabel})") ++
          distinctSourceIds.zipWithIndex.map(sourceIdWithIndex => s"(source${sourceIdWithIndex._2}:${SourceLabel} { id: $$source${sourceIdWithIndex._2} })")

        val whereClauses: List[String] =
          if (query.filters.isDefined && query.filters.get.sourceIds.isDefined) {
            query.filters.get.sourceIds.get.exclude.toList.flatMap(
              _.map(excludeSourceId => s"NOT (node)-[:${SourceRelationshipType}]-(source${distinctSourceIds.indexOf(excludeSourceId)})"
              )) ++
              query.filters.get.sourceIds.get.include.toList.flatMap(
                _.map(includeSourceId => s"(node)-[:${SourceRelationshipType}]-(source${distinctSourceIds.indexOf(includeSourceId)})"
                ))
          } else {
            List()
          }

        KgNodeQueryCypher(
          bindings = (textBindings ++ distinctSourceIdBindings).toMap,
          fulltextCall = fulltextCall,
          matchClauses = matchClauses,
          whereClauses = whereClauses
        )
      }
    }

    private def toTransactionRunParameters(map: Map[String, Any]) =
      map.asJava.asInstanceOf[java.util.Map[String, Object]]
  }

  final override def getSourcesById: Map[String, KgSource] =
    withReadTransaction { _.getSourcesById }

  override final def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge] =
    withReadTransaction { _.getEdgesByObject(limit, objectNodeId, offset) }

  override final def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge] =
    withReadTransaction { _.getEdgesBySubject(limit, offset, subjectNodeId) }

  final override def getMatchingNodeFacets(query: KgNodeQuery): KgNodeFacets =
    withReadTransaction { _.getMatchingNodeFacets(query) }

  final override def getMatchingNodes(limit: Int, offset: Int, query: KgNodeQuery, sorts: Option[List[KgNodeSort]]): List[KgNode] =
    withReadTransaction { _.getMatchingNodes(limit, offset, query, sorts) }

  final override def getMatchingNodesCount(query: KgNodeQuery): Int =
    withReadTransaction { _.getMatchingNodesCount(query) }

  override final def getNodeById(id: String): Option[KgNode] =
    withReadTransaction { _.getNodeById(id) }

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
    withReadTransaction { _.getPathById(id) }

  final override def getRandomNode: KgNode =
    withReadTransaction { _.getRandomNode }

  final override def getTopEdgesByObject(limit: Int, objectNodeId: String): List[KgEdge] =
    withReadTransaction { _.getTopEdgesByObject(limit, objectNodeId) }

  final override def getTopEdgesBySubject(limit: Int, subjectNodeId: String): List[KgEdge] =
    withReadTransaction { _.getTopEdgesBySubject(limit, subjectNodeId) }

  final override def getTotalEdgesCount: Int =
    withReadTransaction { _.getTotalEdgesCount }

  final override def getTotalNodesCount: Int =
    withReadTransaction { _.getTotalNodesCount }

  final override def isEmpty: Boolean =
    withReadTransaction { _.isEmpty }
}
