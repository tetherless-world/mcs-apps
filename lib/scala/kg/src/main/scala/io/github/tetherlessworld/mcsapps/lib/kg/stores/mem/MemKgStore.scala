package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import com.outr.lucene4s._
import com.outr.lucene4s.facet.FacetField
import com.outr.lucene4s.query._
import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData.nodes
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeContext, KgNodeLabel, KgNodeLabelContext}
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgSearchFacets, KgSearchQuery, KgSearchResult, KgSearchSort}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores._
import javax.inject.Singleton

import scala.annotation.tailrec
import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.util.Random

@Singleton
class MemKgStore extends KgCommandStore with KgQueryStore {
  private val NodeContextTopEdgesLimit = 10
  private val NodeLabelContextTopEdgesLimit = 10

  private class MemKgCommandStoreTransaction extends KgCommandStoreTransaction {
    final override def clear(): Unit = {
      edges = List()
      nodeLabelsByLabel = Map()
      nodesById = Map()
      sourcesById = Map()

      index.clear()
    }

    override def close(): Unit = {
      nodesById = PageRank.calculateNodePageRanks(nodesById.values.toList.sortBy(_.id), edges).map(node => (node.id, node)).toMap

      nodesById = nodesById.mapValues(node => node.copy(inDegree = Some(edges.count(_.`object` == node.id)), outDegree = Some(edges.count(_.subject == node.id))))

      val nodeLabels = PageRank.calculateNodeLabelPageRanks(nodesById = nodesById, edges = edges)
      nodeLabelsByLabel = nodeLabels.map(nodeLabel => (nodeLabel.nodeLabel, nodeLabel)).toMap

      index.index(nodesById = nodesById, nodeLabelsByLabel = nodeLabelsByLabel, sourcesById = sourcesById)
    }

    final override def putEdges(edgesIterator: Iterator[KgEdge]): Unit = {
      edges ++= edgesIterator.toList
      putSourceIds(edges.flatMap(_.sourceIds).distinct)
    }

    final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit = {
      val edgesWithNodesList = edgesWithNodes.toList
      val uniqueEdges = edgesWithNodesList.map(edgeWithNodes => (edgeWithNodes.edge.id, edgeWithNodes.edge)).toMap.values.toList
      val nodes = edgesWithNodesList.flatMap(edgeWithNodes => List(edgeWithNodes.node1, edgeWithNodes.node2))

      putNodes(nodes)
      putEdges(uniqueEdges)
    }

    final def putNode(node: KgNode): Unit = {
      val existingNode = nodesById.get(node.id)

      nodesById = nodesById + (node.id -> { if (existingNode.isDefined) {
        existingNode.get.copy(sourceIds = existingNode.get.sourceIds.union(node.sourceIds))
      } else {
        node
      }})
    }

    final override def putNodes(nodesIterator: Iterator[KgNode]): Unit =
      nodesIterator.foreach(putNode)

    private def putSourceIds(sourceIds: List[String]): Unit =
      putSources(sourceIds.map(KgSource(_)))

    final override def putSources(sources: Iterator[KgSource]): Unit = {
      for (source <- sources) {
        if (!sourcesById.contains(source.id)) {
          sourcesById += (source.id -> source)
        }
      }
    }
  }

  // Don't store redundant data structures e.g., nodes + nodesById
  private var edges: List[KgEdge] = List()
  private val index = new MemKgIndex()
  private var nodeLabelsByLabel: Map[String, KgNodeLabel] = Map()
  private var nodesById: Map[String, KgNode] = Map()
  private val random = new Random()
  private var sourcesById: Map[String, KgSource] = Map()

  final override def beginTransaction(): KgCommandStoreTransaction =
    new MemKgCommandStoreTransaction

  final override def getNode(id: String): Option[KgNode] =
    nodesById.get(id)

  final override def getNodeContext(id: String): Option[KgNodeContext] = {
    getNode(id).map(node => {
      // Group edges by predicate and take the top <limit> edges within each predicate group
      val topEdges = edges.filter(_.subject == id).groupBy(_.predicate).mapValues(_.sortBy(edge => nodesById(edge.subject).pageRank.get)(Ordering[Double].reverse).take(NodeContextTopEdgesLimit)).values.flatten.toList
      KgNodeContext(
        // override sourceIds for nodeLabels to be intersection of node.sourceIds and nodeLabel.sourceIds
        relatedNodeLabels = topEdges.map(_.`object`).distinct.flatMap(getNode(_)).flatMap(_.labels).flatMap(getNodeLabel(_)).map(nodeLabel => nodeLabel.copy(sourceIds = nodeLabel.sourceIds.intersect(node.sourceIds))),
        topEdges = topEdges
      )
    })
  }

  final override def getNodeLabel(label: String): Option[KgNodeLabel] = {
    nodeLabelsByLabel.get(label)
  }

  final override def getNodeLabelContext(label: String): Option[KgNodeLabelContext] = {
    getNodeLabel(label).map(_ => {
      val topEdges =
        // Group edges by predicate
        edges.groupBy(_.predicate).mapValues(edgesWithPredicate => {
          // Group edges by object label
          // Since a node can have multiple labels, the same edge can be in multiple groups
          // Each group should only have one reference to a unique edge, however, so we use a map.
          val edgesByObjectLabels = new mutable.HashMap[String, mutable.HashMap[String, KgEdge]]
          for (edge <- edgesWithPredicate) {
            for (objectLabel <- nodesById(edge.`object`).labels) {
              edgesByObjectLabels.getOrElseUpdate(objectLabel, new mutable.HashMap[String, KgEdge])(edge.id) = edge
            }
          }
          // Calculate the PageRank of each object label group
          // Take the top <limit> groups by PageRank and return all of the edges in each group (i.e., all edges with the same label)
          edgesByObjectLabels.map({ case (objectLabel, edgesById) =>
            // Label page rank = max of the constituent node page ranks
            //            val objectLabelPageRank = KgNodeLabelPageRankCalculator(edgesById.values.map(edge => nodesById(edge.`object`)))
            val objectLabelPageRank = nodeLabelsByLabel(objectLabel).pageRank.get

            (objectLabel, edgesById.values.toList.sortBy(_.id), objectLabelPageRank)
          }).toList.sortBy(_._1).sortBy(_._3)(Ordering[Double].reverse).map(_._2).take(NodeLabelContextTopEdgesLimit).flatten
        }).values.flatten.toList

      KgNodeLabelContext(
        relatedNodeLabels = topEdges.map(_.`object`).distinct.flatMap(getNode(_)).flatMap(_.labels).distinct.flatMap(getNodeLabel(_)).sortBy(_.nodeLabel),
        topEdges = topEdges
      )
    })
  }

  final override def getSourcesById: Map[String, KgSource] =
    sourcesById

  final override def getRandomNode: KgNode =
    nodesById.values.toList(random.nextInt(nodesById.size))

  final override def getTotalEdgesCount: Int =
    edges.size

  final override def getTotalNodesCount: Int =
    nodesById.size

  override def isEmpty: Boolean =
    edges.isEmpty && nodesById.isEmpty

  final override def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] =
    index.search(limit = limit, offset = offset, query = query, sorts = sorts)

  final override def searchCount(query: KgSearchQuery): Int =
    index.searchCount(query = query)

  final override def searchFacets(query: KgSearchQuery): KgSearchFacets =
    index.searchFacets(query = query)
}
