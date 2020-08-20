package io.github.tetherlessworld.mcsapps.lib.kg.stores

import com.google.inject.ImplementedBy
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgPath, KgSource}

@ImplementedBy(classOf[Neo4jKgQueryStore])
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
   * Get a node by ID.
   */
  def getNodeById(id: String): Option[KgNode]

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
