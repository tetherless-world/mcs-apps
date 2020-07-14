package data.kg

import models.kg.{KgEdge, KgNode}
import scala.collection.mutable.HashMap

class KgtkData(edges: List[KgEdge], nodes: List[KgNode])
  extends KgData(edges, nodes, List()) {

  def this(data: Tuple3[List[KgEdge], List[KgNode], List[KgNode]]) =
    this(edges = data._1, nodes = KgtkData.reduceNodes(data._2, data._3))

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
      aliases = Some((node1.aliases getOrElse List()) ::: (node2.aliases getOrElse List()) distinct),
      datasource = node1.datasource,
      datasources = node1.datasources ::: node2.datasources distinct,
      id = node1.id, // should be equal
      label = node1.label,
      other = None,
      pos = None,
    )
}
