package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode}

import scala.annotation.tailrec
import scala.collection.GenSeq
import scala.math.sqrt

object KgNodeLabelPageRankCalculator {
  def apply(nodes: Iterable[KgNode]): Double = {
    val pageRanks = nodes.flatMap(node => node.pageRank)
    if (pageRanks.nonEmpty) pageRanks.max(Ordering.Double) else 0.0
  }
}
