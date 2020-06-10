package stores

import com.google.inject.ImplementedBy
import models.cskg.{Edge, Node}
import models.path.Path

@ImplementedBy(classOf[Neo4jStore])
trait Store {
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
  def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[Edge]

  /**
   * Get edges that have the given node ID as a subject.
   */
  def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[Edge]

  /**
   * Fulltext search nodes.
   */
  def getMatchingNodes(filters: Option[NodeFilters], limit: Int, offset: Int, text: String): List[Node]

  /**
   * Get count of fulltext search results.
   */
  def getMatchingNodesCount(filters: Option[NodeFilters], text: String): Int;

  def getPaths: List[Path]

  def getPathById(id: String): Option[Path]

  /**
   * Get a node by ID.
   */
  def getNodeById(id: String): Option[Node]

  /**
   * Get a random node
   */
  def getRandomNode: Node

  /**
   * Get toal number of edges.
   */
  def getTotalEdgesCount: Int;

  /**
   * Get total number of nodes.
   */
  def getTotalNodesCount: Int;

  /**
   * Put the given edges to the store
   */
  def putEdges(edges: Traversable[Edge]): Unit

  /**
   * Put the given nodes to the store
   */
  def putNodes(nodes: Traversable[Node]): Unit

  /**
   * Put the given paths to the store
   */
  def putPaths(paths: Traversable[Path]): Unit
}
