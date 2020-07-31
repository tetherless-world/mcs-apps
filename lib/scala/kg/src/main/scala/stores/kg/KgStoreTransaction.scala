package stores.kg

import data.kg.KgData
import formats.kg.kgtk.KgtkEdgeWithNodes
import models.kg.{KgEdge, KgNode, KgPath, KgSource}

trait KgStoreTransaction {
  final def putEdges(edges: Iterable[KgEdge]): Unit =
    putEdges(edges.iterator)

  /**
   * Convenience method for putting a KgData to the store.
   *
   * Also useful for batch writing to a transactional store.
   */
  def putData(data: KgData): Unit = {
    putSources(data.sources)
    putNodes(data.nodesUnranked)
    putEdges(data.edges)
    putPaths(data.paths)
  }

  /**
   * Put the given edges to the store
   */
  def putEdges(edges: Iterator[KgEdge]): Unit

  final def putNodes(nodes: Iterable[KgNode]): Unit =
    putNodes(nodes.iterator)

  /**
   * Put the KGTK edges with nodes to the store
   */
  def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes])

  /**
   * Put the given nodes to the store
   */
  def putNodes(nodes: Iterator[KgNode]): Unit

  final def putPaths(paths: Iterable[KgPath]): Unit =
    putPaths(paths.iterator)

  /**
   * Put the given paths to the store
   */
  def putPaths(paths: Iterator[KgPath]): Unit

  /**
   * Put the given sources to the store
   */
  final def putSources(sources: Iterable[KgSource]): Unit =
    putSources(sources.iterator)

  /**
   * Put the given sources to the store
   */
  def putSources(sources: Iterator[KgSource]): Unit
}
