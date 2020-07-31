package stores.kg

import com.google.inject.ImplementedBy
import data.kg.KgData
import formats.kg.kgtk.KgtkEdgeWithNodes
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import stores.kg.neo4j.Neo4jKgStore

@ImplementedBy(classOf[Neo4jKgStore])
trait KgStore {
  /**
   * Clear the store.
   *
   * This operation is not guaranteed to complete immediately. It should not be used for large stores.
   */
  def clear()

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
   * Fulltext search nodes.
   */
  def getMatchingNodes(filters: Option[KgNodeFilters], limit: Int, offset: Int, text: Option[String]): List[KgNode]

  /**
   * Get count of fulltext search results.
   */
  def getMatchingNodesCount(filters: Option[KgNodeFilters], text: Option[String]): Int;

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
