package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.data.KgData
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.KgNode
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource

trait KgCommandStoreTransaction extends AutoCloseable {
  /**
   * Clear the store.
   *
   * This operation is not guaranteed to complete immediately. It should not be used for large stores.
   */
  def clear()

  /**
   * Convenience method for putting a KgData to the store.
   *
   * Also useful for batch writing to a transactional store.
   */
  def putData(data: KgData): Unit = {
    putSources(data.sources)
    putNodes(data.nodesUnranked)
    putEdges(data.edges)
  }

  /**
   * Put the given edges to the store
   */
  final def putEdges(edges: Iterable[KgEdge]): Unit =
    putEdges(edges.iterator)

  /**
   * Put the given edges to the store
   */
  def putEdges(edges: Iterator[KgEdge]): Unit

  /**
   * Put the KGTK edges with nodes to the store
   */
  def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes])

  /**
   * Put the given nodes to the store
   */
  final def putNodes(nodes: Iterable[KgNode]): Unit =
    putNodes(nodes.iterator)

  /**
   * Put the given nodes to the store
   */
  def putNodes(nodes: Iterator[KgNode]): Unit

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
