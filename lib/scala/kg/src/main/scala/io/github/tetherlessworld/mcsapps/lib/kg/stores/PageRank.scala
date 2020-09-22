package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeLabel}

import scala.annotation.tailrec
import scala.collection.{GenSeq, mutable}
import scala.math.sqrt

class PageRank(val nodes: List[KgNode], val edges: List[KgEdge]) {
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
      dampingFactor * inboundNodesSum + (1 - dampingFactor) ///pageRanks.size
    })

    if (sqrt(newPageRanks.zip(pageRanks).map(p => (p._1 - p._2) * (p._1 - p._2)).sum / newPageRanks.size) <= convergenceThreshold)
      newPageRanks
    else
      calcNodePageRanks(newPageRanks, iteration + 1, maxIterations, dampingFactor, convergenceThreshold)
  }
}

object PageRank {
  def calculateNodePageRanks(
                              nodes: List[KgNode],
                              edges: List[KgEdge],
                              maxIterations: Int = 20,
                              dampingFactor: Double = 0.85,
                              convergenceThreshold: Double = 0.0000001 // match neo4j config
                            ): List[KgNode] =
    new PageRank(nodes, edges).calcNodePageRanks(
      pageRanks = nodes map { _ => (1.0 / nodes.size) },
      iteration = 0,
      maxIterations = maxIterations,
      dampingFactor = dampingFactor,
      convergenceThreshold = convergenceThreshold,
    ).zipWithIndex.map(nodeRank => nodes(nodeRank._2).copy(pageRank = Some(nodeRank._1))).toList

  def calculateNodeLabelPageRanks(
                                   nodesById: Map[String, KgNode], edges: List[KgEdge]
                                 ): List[KgNodeLabel] = {
    // Form a KgNode+KgEdge graph out of node labels
    val nodeLabelEdgesMap = new mutable.HashMap[String, mutable.Set[String]] with mutable.MultiMap[String, String]
    for (edge <- edges) {
      val subjectNode = nodesById.get(edge.subject)
      val objectNode = nodesById.get(edge.`object`)
      if (subjectNode.isDefined && objectNode.isDefined) {
        for (subjectNodeLabel <- subjectNode.get.labels) {
          for (objectNodeLabel <- objectNode.get.labels) {
            nodeLabelEdgesMap.addBinding(subjectNodeLabel, objectNodeLabel)
          }
        }
      }
    }
    val nodeLabelEdges = nodeLabelEdgesMap.flatMap({ case (subjectNodeLabel, objectNodeLabels) =>
      objectNodeLabels.toList.map(objectNodeLabel =>
        KgEdge(
          id = s"${subjectNodeLabel}-${objectNodeLabel}",
          labels = List(),
          `object` = objectNodeLabel,
          predicate = "/r/RelatedTo",
          sentences = List(),
          sourceIds = List(),
          subject = subjectNodeLabel
        ))
    }).toList

    val nodeLabels = KgNodeLabel.fromNodes(nodesById.values).sortBy(_.nodeLabel)

    val nodeLabelNodes = nodeLabels.map(nodeLabel =>
      KgNode(
        id = nodeLabel.nodeLabel,
        labels = List(),
        pageRank = None,
        pos = None,
        sourceIds = List(),
        wordNetSenseNumber = None
      ))

    val nodeLabelNodesWithPageRanks = calculateNodePageRanks(nodeLabelNodes, nodeLabelEdges)

    nodeLabels.zip(nodeLabelNodesWithPageRanks).map({ case (nodeLabel, nodeLabelNode) => {
      if (nodeLabel.nodeLabel != nodeLabelNode.id) {
        throw new IllegalStateException()
      }
      nodeLabel.copy(pageRank = nodeLabelNode.pageRank)
    }})
  }
}
