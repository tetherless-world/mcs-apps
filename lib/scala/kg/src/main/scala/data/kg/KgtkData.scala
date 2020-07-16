package data.kg

import formats.kg.kgtk.KgtkEdgeWithNodes
import models.kg.{KgEdge, KgNode}

import scala.collection.mutable.HashMap

class KgtkData(edges: List[KgEdge], nodes: List[KgNode])
  extends KgData(edges, nodes, List()) {

  def this(data: List[KgtkEdgeWithNodes]) =
    this(edges = data.map(_.edge), nodes = KgtkData.reduceNodes(data.map(_.node1), data.map(_.node2)))

  def this(resource: KgtkDataResource) =
    this(data = resource.read())
}

object KgtkData {
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
      sources = node1.sources ::: node2.sources distinct
    )
}
