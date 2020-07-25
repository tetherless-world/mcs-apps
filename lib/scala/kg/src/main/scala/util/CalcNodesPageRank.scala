package util

import models.kg.{KgEdge, KgNode}

import scala.annotation.tailrec
import scala.collection.GenSeq
import scala.math.sqrt

object CalcNodesPageRank {
  private var nodes: List[KgNode] = List()
  private var nodeIndexById: Map[String, Int] = Map()
  private var edges: List[KgEdge] = List()

  def apply(
             nodes: List[KgNode],
             edges: List[KgEdge],
             maxIterations: Int = 1000,
            dampingFactor: Double = 0.85,
            convergenceThreshold: Double = 0.01
           ): List[KgNode] = {
    this.nodes = nodes
    this.edges = edges
    this.nodeIndexById = nodes.map(_.id).zipWithIndex.toMap
    calcNodePageRanks(
      pageRanks = nodes map {_ => (1.0 / nodes.size)},
      maxIterations = maxIterations,
      dampingFactor = dampingFactor,
      convergenceThreshold = convergenceThreshold,
    ).zipWithIndex.map(nodeRank => this.nodes(nodeRank._2).copy(pageRank = Some(nodeRank._1))).toList
  }

  @tailrec private def calcNodePageRanks(
                                                pageRanks: GenSeq[Double],
                                                iteration: Int = 0,
                                                maxIterations: Int = 1000,
                                                dampingFactor: Double = 0.85,
                                                convergenceThreshold: Double = 0.01
                                              ): GenSeq[Double] = {
    if (iteration >= maxIterations) return pageRanks

    val newPageRanks: GenSeq[Double] = pageRanks.zipWithIndex.map({ nodeRank =>
      val nodeId = this.nodes(nodeRank._2).id
      val inboundNodes = this.edges.filter(_.`object` == nodeId).map(_.subject)
      val inboundNodesSum = inboundNodes.map {
        inboundNodeId => pageRanks(this.nodeIndexById(inboundNodeId)) / this.edges.filter{edge => edge.subject == inboundNodeId}.size
      }.sum
      dampingFactor*inboundNodesSum + (1-dampingFactor)/pageRanks.size
    })

    if (sqrt(newPageRanks.zip(pageRanks).map(p=>(p._1-p._2)*(p._1-p._2)).sum/newPageRanks.size)<=convergenceThreshold)
      newPageRanks
    else
      calcNodePageRanks(newPageRanks, iteration + 1, maxIterations, dampingFactor, convergenceThreshold)
  }
}
