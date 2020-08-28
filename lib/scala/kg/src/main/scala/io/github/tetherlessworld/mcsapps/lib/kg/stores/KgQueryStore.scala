package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgPath, KgSource}

trait KgQueryStore {
//  def getEdges(filters: KgEdgeFilters, limit: Int, offset: Int)

  /**
   * Get a node by ID.
   */
  def getNodeById(id: String): Option[KgNode]

  /**
   * Get nodes by label.
   */
  def getNodesByLabel(label: String): List[KgNode]

  /**
   * Get a path by id.
   */
  def getPathById(id: String): Option[KgPath]

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

  def getTopEdges(filters: KgEdgeFilters, limit: Int, sort: KgEdgeSortField): List[KgEdge]

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
