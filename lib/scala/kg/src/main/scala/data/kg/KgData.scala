package data.kg

import formats.kg.kgtk.KgtkEdgeWithNodes
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import util.NodePageRankCalculator

import scala.collection.mutable.HashMap

abstract class KgData(edgesUnsorted: List[KgEdge], nodesUnsorted: List[KgNode], pathsUnsorted: List[KgPath]) {
  private val nodesByIdUnranked = deduplicateNodes(sortNodes(nodesUnsorted))
  val nodesUnranked = nodesByIdUnranked.values.toList
  val edges = sortEdges(checkDanglingEdges(checkDuplicateEdges(edgesUnsorted), nodesByIdUnranked))
  val edgesBySubjectId = edges.groupBy(edge => edge.subject)
  val edgesByObjectId = edges.groupBy(edge => edge.`object`)
  val paths = validatePaths(edges, nodesByIdUnranked, pathsUnsorted)
  val sourcesById = (nodesByIdUnranked.flatMap(_._2.sourceIds) ++ edges.flatMap(_.sources)).map(KgSource(_)).map(source => (source.id, source)).toMap
  val sources = sourcesById.values.toList
  val nodes = NodePageRankCalculator(nodesByIdUnranked.values.toList, edges)
  val nodesById = nodes.map{node => (node.id, node)}.toMap

  def this(kgtkEdgesWithNodes: List[KgtkEdgeWithNodes], pathsUnsorted: List[KgPath]) =
    this(
      edgesUnsorted = kgtkEdgesWithNodes.map(_.edge),
      nodesUnsorted = kgtkEdgesWithNodes.flatMap(_.nodes),
      pathsUnsorted = pathsUnsorted
    )

  def this(resources: KgtkDataResources) =
    this(resources.readKgtkEdgesWithNodes(), resources.readPaths())

  private def checkDuplicateEdges(edges: List[KgEdge]): List[KgEdge] = {
    // Default toMap duplicate handling = use later key
    val deduplicatedEdges = edges.map(edge => ((edge.subject, edge.predicate, edge.`object`) -> edge)).toMap.values.toList
    if (deduplicatedEdges.size != edges.size) {
      throw new IllegalArgumentException(s"${edges.size - deduplicatedEdges.size} duplicate edges")
    }
    edges
  }

  private def deduplicateNodes(nodes: List[KgNode]): Map[String, KgNode] =
    nodes.map(node => (node.id, node)).toMap

  private def checkDanglingEdges(edges: List[KgEdge], nodesById: Map[String, KgNode]): List[KgEdge] = {
    val nonDanglingEdges = edges.filter(edge => nodesById.contains(edge.subject) && nodesById.contains(edge.`object`))
    if (nonDanglingEdges.size != edges.size) {
      throw new IllegalArgumentException(s"${edges.size - nonDanglingEdges.size} dangling edges")
    }
    edges
  }

  private def sortNodes(nodes: List[KgNode]) =
    nodes.sortBy(node => node.id)

  private def sortEdges(edges: List[KgEdge]) =
    edges.sortBy(edge => (edge.subject, edge.predicate, edge.`object`))

  private def validatePaths(edges: List[KgEdge], nodesById: Map[String, KgNode], paths: List[KgPath]): List[KgPath] = {
    paths.map(path => {
      val pathEdges = path.edges
      for (pathEdge <- pathEdges) {
        if (!nodesById.contains(pathEdge.subject)) {
          throw new IllegalArgumentException("path edge subject is not one of the graph nodes")
        }
        if (!nodesById.contains(pathEdge.`object`)) {
          throw new IllegalArgumentException("path edge subject is not one of the graph nodes")
        }
        if (!edges.exists(edge => (edge.subject == pathEdge.subject && edge.predicate == pathEdge.predicate && edge.`object` == pathEdge.`object`))) {
          throw new IllegalArgumentException("path edge is not one of the graph edges")
        }
      }
      path
    })
  }
}

object KgData {
  def reduceNodes(nodes1: List[KgNode], nodes2: List[KgNode]): List[KgNode] = {
    val nodesById = HashMap[String, KgNode]()
    (nodes1 ::: nodes2).foreach(node => {
      if (nodesById.contains(node.id))
        nodesById(node.id) = mergeNodes(nodesById(node.id), node)
      else
        nodesById += (node.id -> node)
    })
    nodesById.values.toList
  }

  def mergeNodes(node1: KgNode, node2: KgNode) =
    KgNode(
      id = node1.id, // should be equal
      labels = node1.labels ::: node2.labels distinct,
      pos = None,
      sourceIds = node1.sourceIds ::: node2.sourceIds distinct,
      pageRank = None // should not be initialized yet
    )
}
