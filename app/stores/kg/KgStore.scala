package stores.kg

import com.google.inject.ImplementedBy
import models.kg.{KgEdge, KgNode, KgPath}

@ImplementedBy(classOf[Neo4jStore])
trait KgStore {
  /**
   * Clear the store
   */
  def clear()

  /**
   * Get all datasources
   */
  def getDatasources: List[String]

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
  def getMatchingNodes(filters: Option[KgNodeFilters], limit: Int, offset: Int, text: String): List[KgNode]

  /**
   * Get count of fulltext search results.
   */
  def getMatchingNodesCount(filters: Option[KgNodeFilters], text: String): Int;

  def getPaths: List[KgPath]

  def getPathById(id: String): Option[KgPath]

  /**
   * Get a node by ID.
   */
  def getNodeById(id: String): Option[KgNode]

  /**
   * Get a random node
   */
  def getRandomNode: KgNode

  /**
   * Get toal number of edges.
   */
  def getTotalEdgesCount: Int;

  /**
   * Get total number of nodes.
   */
  def getTotalNodesCount: Int;

  def isEmpty: Boolean

  /**
   * Put the given edges to the store
   */
  def putEdges(edges: TraversableOnce[KgEdge]): Unit

  /**
   * Put the given nodes to the store
   */
  def putNodes(nodes: TraversableOnce[KgNode]): Unit

  /**
   * Put the given paths to the store
   */
  def putPaths(paths: TraversableOnce[KgPath]): Unit
}
