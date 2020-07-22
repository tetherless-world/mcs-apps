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
   * Get toal number of edges.
   */
  def getTotalEdgesCount: Int;

  /**
   * Get total number of nodes.
   */
  def getTotalNodesCount: Int;

  def isEmpty: Boolean

  final def putEdges(edges: Iterable[KgEdge]): Unit =
    putEdges(edges.iterator)

  /**
   * Convenience method for putting a KgData to the store.
   *
   * Also useful for batch writing to a transactional store.
   */
  def putData(data: KgData): Unit = {
    putSources(data.sources)
    putNodes(data.nodes)
    putEdges(data.edges)
    putPaths(data.paths)
  }

  /**
   * Put the given edges to the store
   */
  def putEdges(edges: Iterator[KgEdge]): Unit

  final def putNodes(nodes: Iterable[KgNode]): Unit =
    putNodes(nodes.iterator)

  /**
   * Put the KGTK edges with nodes to the store
   */
  def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes])

  /**
   * Put the given nodes to the store
   */
  def putNodes(nodes: Iterator[KgNode]): Unit

  final def putPaths(paths: Iterable[KgPath]): Unit =
    putPaths(paths.iterator)

  /**
   * Put the given paths to the store
   */
  def putPaths(paths: Iterator[KgPath]): Unit

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
