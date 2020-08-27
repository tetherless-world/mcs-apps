package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgPath, KgSource}

trait KgQueryStore {
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
   * Get edges that have the given node ID as an object.
   */
  def getEdgesByObjectNodeId(limit: Int, objectNodeId: String, offset: Int): List[KgEdge]

  /**
   * Get edges that have the given node ID as a subject.
   */
  def getEdgesBySubjectNodeId(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge]

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
   * Get top edges using pageRank grouped by relation that have the given node ID as an object
   */
  def getTopEdgesByObjectNodeId(limit: Int, objectNodeId: String): List[KgEdge]

  /**
   * Get top edges using pageRank grouped by relation that have the given node label as an object
   */
  def getTopEdgesByObjectNodeLabel(limit: Int, objectNodeLabel: String): List[KgEdge]

  /**
   * Get top edges using pageRank grouped by relation that have the given node ID as a subject
   */
  def getTopEdgesBySubjectNodeId(limit: Int, subjectNodeId: String): List[KgEdge]

  /**
   * Get top edges using pageRank grouped by relation that have the given node label as a subject
   */
  def getTopEdgesBySubjectNodeLabel(limit: Int, subjectNodeLabel: String): List[KgEdge]

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
