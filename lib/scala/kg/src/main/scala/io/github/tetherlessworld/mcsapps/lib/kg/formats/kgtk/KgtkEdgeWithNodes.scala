package io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.KgNode

final case class KgtkEdgeWithNodes(edge: KgEdge, node1: KgNode, node2: KgNode, sources: List[String]) {
  def nodes = List(node1, node2)
}
