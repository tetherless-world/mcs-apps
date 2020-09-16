package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgNodeLabel, KgPath, KgSource}

trait KgQueryStore {
  def getEdges(filters: KgEdgeFilters, limit: Int, offset: Int, sort: KgEdgesSort): List[KgEdge]

  /**
   * Get a node by ID.
   */
  def getNode(id: String): Option[KgNode]

  /**
   * Get a node's context, for the node page.
   */
  def getNodeContext(id: String): Option[KgNodeContext]

  /**
   * Get a node label by label.
   */
  def getNodeLabel(label: String): Option[KgNodeLabel]

  /**
   * Get a node label's context, for the node label page.
   */
  def getNodeLabelContext(label: String): Option[KgNodeLabelContext]

  /**
   * Get a path by id.
   */
  def getPath(id: String): Option[KgPath]

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
