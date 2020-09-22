package io.github.tetherlessworld.mcsapps.lib.kg.stores.empty

import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeContext, KgNodeLabel, KgNodeLabelContext}
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgSearchFacets, KgSearchQuery, KgSearchResult, KgSearchSort}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores._

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

  final override def getNode(id: String): Option[KgNode] = None

  final override def getNodeContext(id: String): Option[KgNodeContext] = None

  final override def getNodeLabelContext(label: String): Option[KgNodeLabelContext] = None

  final override def getNodeLabel(label: String): Option[KgNodeLabel] = None

  final override def getPath(id: String): Option[KgPath] = None

  final override def getRandomNode: KgNode = throw new NoSuchElementException

  final override def getSourcesById: Map[String, KgSource] = Map()

  final override def getTotalEdgesCount: Int = 0

  final override def getTotalNodesCount: Int = 0

  final override def isEmpty: Boolean = true

  final override def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] = List()

  final override def searchCount(query: KgSearchQuery): Int = 0

  final override def searchFacets(query: KgSearchQuery): KgSearchFacets = KgSearchFacets(List())
}
