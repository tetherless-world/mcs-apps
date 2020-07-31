package stores.kg.neo4j

import formats.kg.kgtk.KgtkEdgeWithNodes
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import org.neo4j.driver.{Result, Transaction}
import org.slf4j.LoggerFactory
import stores.Neo4jStoreConfiguration
import stores.kg.{KgNodeFilters, KgStore}

import scala.collection.JavaConverters._
import scala.collection.mutable

/**
 * Implicit class to add KgStore methods to a neo4j Transaction.
 */
class Neo4jKgStoreTransactionWrapper(transaction: Transaction) extends KgStore {
  private val edgePropertyNameList = List("id", "labels", "object", "origins", "questions", "sentences", "sources", "subject", "weight")
  private val edgePropertyNamesString = edgePropertyNameList.map(edgePropertyName => "edge." + edgePropertyName).mkString(", ")
  private val ListDelimString = Neo4jKgStore.ListDelimChar.toString
  private val logger = LoggerFactory.getLogger(getClass)
  private val nodePropertyNameList = List("id", "labels", "pos", "sources", "pageRank")
  private val nodePropertyNamesString = nodePropertyNameList.map(nodePropertyName => "node." + nodePropertyName).mkString(", ")
  private val pathPropertyNameList = List("id", "objectNode", "pathEdgeIndex", "pathEdgePredicate", "sources", "subjectNode")
  private val pathPropertyNamesString = pathPropertyNameList.map(pathPropertyName => "path." + pathPropertyName).mkString(", ")
  private val PathRelationshipType = "PATH"
  private val SourceRelationshipType = "SOURCE"

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
         |MATCH (subject:Node {id: $$subjectNodeId})-[edge]->(object:Node)
         |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
         |ORDER BY type(edge), object.pageRank, edge
         |SKIP ${offset}
         |LIMIT ${limit}
         |""".stripMargin,
      toTransactionRunParameters(Map(
        "subjectNodeId" -> subjectNodeId
      ))
    ).toEdges

  final override def getMatchingNodes(filters: Option[KgNodeFilters], limit: Int, offset: Int, text: Option[String]): List[KgNode] = {
    val (cypher, bindings) = toMatchingNodesCypher(filters, text)
    transaction.run(
      s"""${cypher}
         |RETURN ${nodePropertyNamesString}
         |SKIP ${offset}
         |LIMIT ${limit}
         |""".stripMargin,
      toTransactionRunParameters(bindings)
    ).toNodes
  }

  final override def getMatchingNodesCount(filters: Option[KgNodeFilters], text: Option[String]): Int = {
    val (cypher, bindings) = toMatchingNodesCypher(filters, text)
    val result =
      transaction.run(
        s"""${cypher}
           |RETURN COUNT(node)
           |""".stripMargin,
        toTransactionRunParameters(bindings)
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
      s"""MATCH (subjectNode:Node)-[path:${PathRelationshipType} {id: $$id}]->(objectNode:Node)
         |RETURN objectNode.id, subjectNode.id, ${pathPropertyNamesString}
         |""".stripMargin,
      toTransactionRunParameters(Map("id" -> id))
    ).toPaths.headOption

  final override def getRandomNode: KgNode =
    transaction.run(
      s"MATCH (node:Node) RETURN ${nodePropertyNamesString}, rand() as rand ORDER BY rand ASC LIMIT 1"
    ).toNodes.head

  /**
   * Get top edges using pageRank grouped by relation that have the given node ID as an object
   */
  final override def getTopEdgesByObject(limit: Int, objectNodeId: String): List[KgEdge] = {
    transaction.run(
      s"""
         |MATCH (subject:Node)-[edge]->(object:Node {id: $$objectNodeId})
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
         |MATCH (subject:Node {id: $$subjectNodeId})-[edge]->(object:Node)
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
        |MATCH (subject:Node)-[r]->(object:Node)
        |WHERE NOT type(r) = "${PathRelationshipType}"
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
    // The putEdges, putNodes, et al. methods assume that the iterator is small enough to buffer.
    // We buffer here, but the transaction also buffers.
    val edgesList = edges.toList
    putSources(edgesList.flatMap(_.sources).distinct.map(KgSource(_)))
    for (edge <- edgesList) {
      putEdge(edge)
    }
  }

  final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit = {
    val edgesWithNodesList = edgesWithNodes.toList
    // Neo4j doesn't tolerate duplicate nodes
    val putNodeIds = new mutable.HashSet[String]
    putSources(edgesWithNodesList.flatMap(_.sources).distinct.map(KgSource(_)))
    for (edgeWithNodes <- edgesWithNodesList) {
      if (putNodeIds.add(edgeWithNodes.node1.id)) {
        putNode(edgeWithNodes.node1)
      }
      if (putNodeIds.add(edgeWithNodes.node2.id)) {
        putNode(edgeWithNodes.node2)
      }
      putEdge(edgeWithNodes.edge)
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
    // Store sources as a delimited list on the node so they can be retrieved accurately
    // In order to do filtering on individual sources we need to break them out as nodes.
    // This is the standard way of doing multi-valued properties in neo4j: make the values
    // separate nodes and connect to them.
    // See #168.
    for (sourceId <- node.sources) {
      transaction.run(
        s"""
           |MATCH (source:Source), (node:Node)
           |WHERE node.id = $$nodeId AND source.id = $$sourceId
           |CREATE (node)-[:${SourceRelationshipType}]->(source)
           |""".stripMargin,
        toTransactionRunParameters(Map(
          "nodeId" -> node.id,
          "sourceId" -> sourceId
        ))
      )
    }
  }

  final override def putNodes(nodes: Iterator[KgNode]): Unit = {
    val nodesList = nodes.toList
    putSources(nodesList.flatMap(_.sources).distinct.map(KgSource(_)))
    for (node <- nodesList) {
      putNode(node)
    }
  }

  final override def putPaths(paths: Iterator[KgPath]): Unit =
    for (path <- paths) {
      for (pathEdgeWithIndex <- path.edges.zipWithIndex) {
        val (pathEdge, pathEdgeIndex) = pathEdgeWithIndex
        transaction.run(
          s"""
            |MATCH (subject:Node), (object: Node)
            |WHERE subject.id = $$subject AND object.id = $$object
            |CREATE (subject)-[path:${PathRelationshipType} {id: $$pathId, pathEdgeIndex: $pathEdgeIndex, pathEdgePredicate: $$pathEdgePredicate, sources: $$sources}]->(object)
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
        //        logger.debug("created source {}", source.id)
      }
      //      else {
      //        logger.debug(s"source {} already exists", source.id)
      //      }
    }

  private def toMatchingNodesCypher(filters: Option[KgNodeFilters], text: Option[String]): (String, Map[String, Any]) = {
    // Do this in an semi-imperative way but with immutable data structures and vals. It makes the code more readable.

    val fulltextCypher = text.map(text =>
      """CALL db.index.fulltext.queryNodes("node", $text) YIELD node, score""").toList
    val textBindings = text.map(CypherBinding("text", _)).toList

    val distinctSourceIds =
      if (filters.isDefined && filters.get.sources.isDefined) {
        filters.get.sources.get.exclude.getOrElse(List()) ++ filters.get.sources.get.include.getOrElse(List())
      } else {
        List()
      }.distinct

    val distinctSourceIdBindings = distinctSourceIds.zipWithIndex.map(sourceIdWithIndex => CypherBinding(s"source${sourceIdWithIndex._2}", sourceIdWithIndex._1))

    val matchClauses: List[String] = List("(node: Node)") ++
      distinctSourceIds.zipWithIndex.map(sourceIdWithIndex => s"(source${sourceIdWithIndex._2}:Source { id: $$source${sourceIdWithIndex._2} })")
    val matchCypher = List("MATCH " + matchClauses.mkString(", "))

    val whereClauses: List[String] =
      if (filters.isDefined && filters.get.sources.isDefined) {
        filters.get.sources.get.exclude.toList.flatMap(
          _.map(excludeSourceId => s"NOT (node)-[:${SourceRelationshipType}]-(source${distinctSourceIds.indexOf(excludeSourceId)})"
          )) ++
          filters.get.sources.get.include.toList.flatMap(
            _.map(includeSourceId => s"(node)-[:${SourceRelationshipType}]-(source${distinctSourceIds.indexOf(includeSourceId)})"
            ))
      } else {
        List()
      }
    val whereCypher =
      if (whereClauses.nonEmpty) {
        List("WHERE " + whereClauses.mkString(" AND "))
      } else {
        List()
      }

    val bindings: List[CypherBinding] = textBindings ++ distinctSourceIdBindings
    val cypher = fulltextCypher ++ matchCypher ++ whereCypher

    (cypher.mkString("\n"), bindings.map(binding => (binding.variableName -> binding.value)).toMap)
  }

  //  def toCypherBindingsMap: Map[String, Any] =
  //    filters.flatMap(filter => filter.binding).map(binding => (binding.variableName -> binding.value)).toMap
  //
  //  def toCypherString: String =
  //    if (!filters.isEmpty) {
  //      s"WHERE ${filters.map(filter => filter.cypher).mkString(" AND ")}"
  //    } else {
  //      ""
  //    }
  // Previously used for datasource filters, when we only had one datasource per node
  // Designed to do WHERE exact string = exact value
  //  private def toCypherFilters(bindingVariableNamePrefix: String, property: String, stringFilter: StringFilter): List[CypherFilter] = {
  //    stringFilter.exclude.getOrElse(List()).zipWithIndex.map(excludeWithIndex => {
  //      val bindingVariableName = s"${bindingVariableNamePrefix}Exclude${excludeWithIndex._2}"
  //      CypherFilter(binding = Some(CypherBinding(variableName = bindingVariableName, value = excludeWithIndex._1)), cypher = s"NOT ${property} = $$${bindingVariableName}")
  //    }) ++
  //      stringFilter.include.getOrElse(List()).zipWithIndex.map(includeWithIndex => {
  //        val bindingVariableName = s"${bindingVariableNamePrefix}Include${includeWithIndex._2}"
  //        CypherFilter(binding = Some(CypherBinding(variableName = bindingVariableName, value = includeWithIndex._1)), cypher = s"${property} = $$${bindingVariableName}")
  //      })
  //  }

  private def toTransactionRunParameters(map: Map[String, Any]) =
    map.asJava.asInstanceOf[java.util.Map[String, Object]]

  final override def writeNodePageRanks = {
    transaction.run(
      s"""
        |CALL gds.pageRank.write({
        |nodeQuery: 'MATCH (n: Node) RETURN id(n) as id',
        |relationshipQuery: 'MATCH (source: Node)-[r]->(target: Node) WHERE TYPE(r)<>"${PathRelationshipType}" RETURN id(source) as source, id(target) as target',
        |writeProperty: 'pageRank'
        |})
        |""".stripMargin
    )
  }
}
