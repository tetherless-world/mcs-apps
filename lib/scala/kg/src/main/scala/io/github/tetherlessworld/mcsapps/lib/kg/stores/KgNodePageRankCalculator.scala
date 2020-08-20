package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode}

import scala.annotation.tailrec
import scala.collection.GenSeq
import scala.math.sqrt

class KgNodePageRankCalculator(val nodes: List[KgNode], val edges: List[KgEdge]) {
  val nodeIndexById = nodes.map(_.id).zipWithIndex.toMap

  @tailrec private def calcNodePageRanks(
                                          pageRanks: GenSeq[Double],
                                          iteration: Int,
                                          maxIterations: Int,
                                          dampingFactor: Double,
                                          convergenceThreshold: Double
                                        ): GenSeq[Double] = {
    if (iteration >= maxIterations) return pageRanks

    val newPageRanks: GenSeq[Double] = pageRanks.zipWithIndex.map({ nodeRank =>
      val nodeId = this.nodes(nodeRank._2).id
      val inboundNodes = this.edges.filter(_.`object` == nodeId).map(_.subject)
      val inboundNodesSum = inboundNodes.map {
        inboundNodeId => pageRanks(this.nodeIndexById(inboundNodeId)) / this.edges.count(_.subject == inboundNodeId)
      }.sum
      dampingFactor*inboundNodesSum + (1-dampingFactor)///pageRanks.size
    })

    if (sqrt(newPageRanks.zip(pageRanks).map(p=>(p._1-p._2)*(p._1-p._2)).sum/newPageRanks.size)<=convergenceThreshold)
      newPageRanks
    else
      calcNodePageRanks(newPageRanks, iteration + 1, maxIterations, dampingFactor, convergenceThreshold)
  }
}

object KgNodePageRankCalculator {
  def apply(
             nodes: List[KgNode],
             edges: List[KgEdge],
             maxIterations: Int = 20,
            dampingFactor: Double = 0.85,
            convergenceThreshold: Double = 0.0000001 // match neo4j config
           ): List[KgNode] =
    new KgNodePageRankCalculator(nodes, edges).calcNodePageRanks(
      pageRanks = nodes map {_ => (1.0 / nodes.size)},
      iteration = 0,
      maxIterations = maxIterations,
      dampingFactor = dampingFactor,
      convergenceThreshold = convergenceThreshold,
    ).zipWithIndex.map(nodeRank => nodes(nodeRank._2).copy(pageRank = Some(nodeRank._1))).toList
}
