package io.github.tetherlessworld.mcsapps.lib.kg.models.node

import scala.collection.mutable

final case class KgNodeLabel(nodeLabel: String, nodes: List[KgNode], pageRank: Option[Double], sourceIds: List[String])

object KgNodeLabel {
  def fromNodes(nodes: Iterable[KgNode]): List[KgNodeLabel] = {
    val nodesByLabel = new mutable.HashMap[String, mutable.HashMap[String, KgNode]]
    for (node <- nodes) {
      for (label <- node.labels) {
        nodesByLabel.getOrElseUpdate(label, new mutable.HashMap)(node.id) = node
      }
    }
    nodesByLabel.map({ case (nodeLabel, nodesById) =>
      KgNodeLabel(nodeLabel, nodesById.values.toList.sortBy(_.id), pageRank = None, sourceIds = nodesById.values.flatMap(_.sourceIds).toList.distinct)
    }).toList
  }
}
