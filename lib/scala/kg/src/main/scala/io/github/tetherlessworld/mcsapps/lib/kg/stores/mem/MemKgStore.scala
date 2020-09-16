package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import com.outr.lucene4s._
import com.outr.lucene4s.facet.FacetField
import com.outr.lucene4s.query._
import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData.nodes
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgNodeLabel, KgPath, KgSource}
import io.github.tetherlessworld.mcsapps.lib.kg.stores._

import scala.annotation.tailrec
import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.util.Random

class MemKgStore extends KgCommandStore with KgQueryStore {

  private class MemKgCommandStoreTransaction extends KgCommandStoreTransaction {
    final override def clear(): Unit = {
      edges = List()
      nodeLabelsByLabel = Map()
      nodesById = Map()
      pathsById = Map()
      sourcesById = Map()

      index.clear()
    }

    override def close(): Unit = {
      nodesById = PageRank.calculateNodePageRanks(nodesById.values.toList.sortBy(_.id), edges).map(node => (node.id, node)).toMap

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
      val uniqueNodes = edgesWithNodesList.flatMap(edgeWithNodes => List((edgeWithNodes.node1.id, edgeWithNodes.node1), (edgeWithNodes.node2.id, edgeWithNodes.node2))).toMap.values.toList
      putNodes(uniqueNodes)
      putEdges(uniqueEdges)
    }

    final override def putNodes(nodesIterator: Iterator[KgNode]): Unit = {
      nodesById ++= nodesIterator.map(node => (node.id, node)).toList
    }

    final override def putPaths(pathsIterator: Iterator[KgPath]): Unit = {
      pathsById ++= pathsIterator.map(path => (path.id, path)).toMap
    }

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
  private var pathsById: Map[String, KgPath] = Map()
  private val random = new Random()
  private var sourcesById: Map[String, KgSource] = Map()

  final override def beginTransaction: KgCommandStoreTransaction =
    new MemKgCommandStoreTransaction

  private def filterEdges(filters: KgEdgeFilters): List[KgEdge] = {
    var edges = this.edges
    if (filters.objectId.isDefined) {
      edges = edges.filter(_.`object` == filters.objectId.get)
    }
    if (filters.objectLabel.isDefined) {
      edges = edges.filter(edge => nodesById(edge.`object`).labels.contains(filters.objectLabel.get))
    }
    if (filters.subjectId.isDefined) {
      edges = edges.filter(_.subject == filters.subjectId.get)
    }
    if (filters.subjectLabel.isDefined) {
      edges = edges.filter(edge => nodesById(edge.subject).labels.contains(filters.subjectLabel.get))
    }
    edges
  }

  final override def getNode(id: String): Option[KgNode] =
    nodesById.get(id)

  final override def getNodesByLabel(label: String): List[KgNode] = {
    nodeLabelsByLabel.get(label).map(nodeLabel => nodeLabel.nodes).getOrElse(List())
  }

  final override def getPath(id: String): Option[KgPath] =
    pathsById.get(id)

  final override def getSourcesById: Map[String, KgSource] =
    sourcesById

  final override def getRandomNode: KgNode =
    nodesById.values.toList(random.nextInt(nodesById.size))

  final override def getSubjectNodeContext(filters: KgEdgeFilters, limit: Int, sort: KgTopEdgesSort): List[KgEdge] = {
    val edges = filterEdges(filters)
    sort.field match {
      case KgTopEdgesSortField.ObjectPageRank =>
        // Group edges by predicate and take the top <limit> edges within each predicate group
        edges.groupBy(_.predicate).mapValues(_.sortBy(edge => nodesById(edge.subject).pageRank.get)(if (sort.direction == SortDirection.Ascending) Ordering.Double else Ordering[Double].reverse).take(limit)).values.flatten.toList
      case KgTopEdgesSortField.ObjectLabelPageRank => {
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
          }).toList.sortBy(_._1).sortBy(_._3)(if (sort.direction == SortDirection.Ascending) Ordering.Double else Ordering[Double].reverse).map(_._2).take(limit).flatten
        }).values.flatten.toList
      }
    }
  }

  final override def getTotalEdgesCount: Int =
    edges.size

  final override def getTotalNodesCount: Int =
    nodesById.size

  override def isEmpty: Boolean =
    edges.isEmpty && nodesById.isEmpty && pathsById.isEmpty

  final override def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] =
    index.search(limit = limit, offset = offset, query = query, sorts = sorts)

  final override def searchCount(query: KgSearchQuery): Int =
    index.searchCount(query = query)

  final override def searchFacets(query: KgSearchQuery): KgSearchFacets =
    index.searchFacets(query = query)
}
