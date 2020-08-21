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
  def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge]

  /**
   * Get edges that have the given node ID as a subject.
   */
  def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge]

  /**
   * Search nodes and return facets.
   */
  def getMatchingNodeFacets(query: KgNodeQuery): KgNodeFacets

  /**
   * Search nodes.
   */
  def getMatchingNodes(limit: Int, offset: Int, query: KgNodeQuery, sorts: Option[List[KgNodeSort]]): List[KgNode]

  /**
   * Get count of fulltext search results.
   */
  def getMatchingNodesCount(query: KgNodeQuery): Int;

  /**
   * Search all node fields and return the set of the labels in the result nodes.
   */
  def getMatchingNodeLabels(limit: Int, offset: Int, query: KgNodeQuery, sorts: Option[List[KgNodeSort]]): List[String]

  /**
   * Search all node fields and return a count of the unique labels in the result nodes.
   */
  def getMatchingNodeLabelsCount(query: KgNodeQuery): Int

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
  def getTopEdgesByObject(limit: Int, objectNodeId: String): List[KgEdge]

  /**
   * Get top edges using pageRank grouped by relation that have the given node ID as a subject
   */
  def getTopEdgesBySubject(limit: Int, subjectNodeId: String): List[KgEdge]

  /**
   * Get total number of edges.
   */
  def getTotalEdgesCount: Int;

  /**
   * Get total number of nodes.
   */
  def getTotalNodesCount: Int;

  def isEmpty: Boolean
}
