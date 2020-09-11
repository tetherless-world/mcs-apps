package io.github.tetherlessworld.mcsapps.lib.kg.stores.empty

import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgPath, KgSource}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgCommandStoreTransaction, KgEdgeFilters, KgEdgesSort, KgQueryStore, KgSearchFacets, KgSearchQuery, KgSearchResult, KgSearchSort, KgTopEdgesSort}

/**
 * Store implementation that is always empty and discards all writes to it.
 *
 * This is used to test processes that fill a store beyond memory, such as loading a full CSKG.
 */
final class EmptyKgStore extends KgCommandStore with KgQueryStore {
  final override def beginTransaction: KgCommandStoreTransaction = new KgCommandStoreTransaction {
    final override def clear(): Unit = {}

    final override def close(): Unit = {}

    final override def putEdges(edges: Iterator[KgEdge]): Unit = {
      while (edges.hasNext) {
        edges.next()
      }
    }

    final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit = {
      while (edgesWithNodes.hasNext) {
        edgesWithNodes.next()
      }
    }

    final override def putNodes(nodes: Iterator[KgNode]): Unit = {
      while (nodes.hasNext) {
        nodes.next()
      }
    }

    final override def putPaths(paths: Iterator[KgPath]): Unit = {
      while (paths.hasNext) {
        paths.next()
      }
    }

    final override def putSources(sources: Iterator[KgSource]): Unit = {
      while (sources.hasNext) {
        sources.next()
      }
    }
  }

  final override def getEdges(filters: KgEdgeFilters, limit: Int, offset: Int, sort: KgEdgesSort): List[KgEdge] = List()

  final override def getSourcesById: Map[String, KgSource] = Map()

  final override def getNodeById(id: String): Option[KgNode] = None

  final override def getNodesByLabel(label: String): List[KgNode] = List()

  final override def getPathById(id: String): Option[KgPath] = None

  final override def getRandomNode: KgNode = throw new NoSuchElementException

  final override def getTopEdges(filters: KgEdgeFilters, limit: Int, sort: KgTopEdgesSort): List[KgEdge] = List()

  final override def getTotalEdgesCount: Int = 0

  final override def getTotalNodesCount: Int = 0

  final override def isEmpty: Boolean = true

  final override def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] = List()

  final override def searchCount(query: KgSearchQuery): Int = 0

  final override def searchFacets(query: KgSearchQuery): KgSearchFacets = KgSearchFacets(List())
}