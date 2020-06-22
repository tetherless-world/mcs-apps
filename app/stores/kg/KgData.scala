package stores.kg

import models.kg.{KgEdge, KgNode, KgPath}

class KgData(edgesUnsorted: List[KgEdge], nodesUnsorted: List[KgNode], pathsUnsorted: List[KgPath]) {
  def this(resources: KgDataResources) =
    this(
      edgesUnsorted = resources.readEdges(),
      nodesUnsorted = resources.readNodes(),
      pathsUnsorted = resources.readPaths()
    )

  val nodesById = deduplicateNodes(sortNodes(nodesUnsorted))
  val nodes = nodesById.values.toList
  val edges = sortEdges(checkDanglingEdges(checkDuplicateEdges(edgesUnsorted), nodesById))
  val edgesBySubjectId = edges.groupBy(edge => edge.subject)
  val edgesByObjectId = edges.groupBy(edge => edge.`object`)
  val paths = validatePaths(edges, nodesById, pathsUnsorted)

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
