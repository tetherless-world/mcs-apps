package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeContext, KgNodeLabel, KgNodeLabelContext}
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgSearchFacets, KgSearchQuery, KgSearchResult, KgSearchSort}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource

trait KgQueryStore {
  /**
   * Get a node by ID.
   * @return the node if it exists, otherwise None
   */
  def getNode(id: String): Option[KgNode]

  /**
   * Get a node's context, for the node page.
   * The context is as seen from the node as a subject.
   * @return the node context if the node exists, otherwise None; the lists in the context may be empty
   */
  def getNodeContext(id: String): Option[KgNodeContext]

  /**
   * Get a node label by label.
   * @return the node label if it exists, otherwise None
   */
  def getNodeLabel(label: String): Option[KgNodeLabel]

  /**
   * Get a node label's context, for the node label page.
   * The context is as seen from the node label as a subject.
   * @return the node label context if the node label exists, otherwise None; the lists in the context may be empty
   */
  def getNodeLabelContext(label: String): Option[KgNodeLabelContext]

  /**
   * Get a random node
   */
  def getRandomNode: KgNode

  /**
   * Get all sources
   */
  final def getSources: List[KgSource] =
    getSourcesById.values.toList

  /**
   * Get sources mapped by id
   */
  def getSourcesById: Map[String, KgSource]

  /**
   * Get total number of edges.
   */
  def getTotalEdgesCount: Int;

  /**
   * Get total number of nodes.
   */
  def getTotalNodesCount: Int;

  def isEmpty: Boolean

  /**
   * Search the store.
   */
  def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult]

  /**
   * Search the store and return the total number of results.
   */
  def searchCount(query: KgSearchQuery): Int

  /**
   * Search the store and return facets of the results.
   *
   * This could be folded into search, but it's cleaner to do it this way.
   */
  def searchFacets(query: KgSearchQuery): KgSearchFacets
}
