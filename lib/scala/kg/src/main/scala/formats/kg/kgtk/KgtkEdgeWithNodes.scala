package formats.kg.kgtk

import models.kg.{KgEdge, KgNode}

final case class KgtkEdgeWithNodes(edge: KgEdge, node1: KgNode, node2: KgNode, sources: List[String]) {
  def nodes = List(node1, node2)
}
