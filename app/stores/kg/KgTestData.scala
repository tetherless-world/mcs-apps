package stores.kg

import java.io.{BufferedInputStream, InputStream}

import formats.kg.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.kg.path.KgPathJsonlReader
import models.kg.{KgEdge, KgNode, KgPath}
import stores.WithResource

import scala.io.Source

object KgTestData extends WithResource {
  val EdgesCsvBz2ResourceName = "/test_data/kg/edges.csv.bz2"
  val NodesCsvBz2ResourceName = "/test_data/kg/nodes.csv.bz2"
  val PathsJsonlResourceName = "/test_data/kg/paths.jsonl"

  val nodesById = deduplicateNodes(sortNodes(readNodes()))
  val nodes = nodesById.values.toList
  val edges = sortEdges(checkDanglingEdges(checkDuplicateEdges(readEdges()), nodesById))
  val edgesBySubjectId = edges.groupBy(edge => edge.subject)
  val edgesByObjectId = edges.groupBy(edge => edge.`object`)
  val paths = validatePaths(edges, nodesById, readPaths())

  private def checkDuplicateEdges(edges: List[KgEdge]): List[KgEdge] = {
    // Default toMap duplicate handling = use later key
    val deduplicatedEdges = edges.map(edge => ((edge.subject, edge.predicate, edge.`object`) -> edge)).toMap.values.toList
    if (deduplicatedEdges.size != edges.size) {
      throw new IllegalArgumentException(s"${edges.size - deduplicatedEdges.size} duplicate edges")
    }
    edges
  }

  private def deduplicateNodes(nodes: List[KgNode]): Map[String, KgNode] =
    nodes.map(node => (node.id, node)).toMap

  def getEdgesCsvResourceAsStream(): InputStream =
    getResourceAsStream(EdgesCsvBz2ResourceName)

  def getNodesCsvResourceAsStream(): InputStream =
    getResourceAsStream(NodesCsvBz2ResourceName)

  def getPathsJsonlResourceAsStream(): InputStream =
    getResourceAsStream(PathsJsonlResourceName)

  private def getResourceAsStream(resourceName: String) =
    new BufferedInputStream(getClass.getResourceAsStream(resourceName))

  private def readEdges(): List[KgEdge] = {
    withResource(CskgEdgesCsvReader.open(getEdgesCsvResourceAsStream())) { reader =>
      reader.toStream.toList
    }
  }

  private def readNodes(): List[KgNode] = {
    withResource(CskgNodesCsvReader.open(getNodesCsvResourceAsStream())) { reader =>
      reader.toStream.toList
    }
  }

  private def readPaths(): List[KgPath] = {
    withResource(new KgPathJsonlReader(Source.fromInputStream(getPathsJsonlResourceAsStream(), "UTF-8"))) { reader =>
      reader.toStream.toList
    }
  }

  private def checkDanglingEdges(edges: List[KgEdge], nodesById: Map[String, KgNode]): List[KgEdge] = {
    val nonDanglingEdges = edges.filter(edge => nodesById.contains(edge.subject) && nodesById.contains(edge.`object`))
    if (nonDanglingEdges.size != edges.size) {
      throw new IllegalArgumentException(s"${edges.size - nonDanglingEdges.size} dangling edges")
    }
    edges
  }

  private def sortNodes(nodes: List[KgNode]) =
    nodes.sortBy(node => node.id)

  private def sortEdges(edges: List[KgEdge]) =
    edges.sortBy(edge => (edge.subject, edge.predicate, edge.`object`))

  private def validatePaths(edges: List[KgEdge], nodesById: Map[String, KgNode], paths: List[KgPath]): List[KgPath] = {
    paths.map(path => {
      val pathEdges = path.edges
      for (pathEdge <- pathEdges) {
        if (!nodesById.contains(pathEdge.subject)) {
          throw new IllegalArgumentException("path edge subject is not one of the graph nodes")
        }
        if (!nodesById.contains(pathEdge.`object`)) {
          throw new IllegalArgumentException("path edge subject is not one of the graph nodes")
        }
        if (!edges.exists(edge => (edge.subject == pathEdge.subject && edge.predicate == pathEdge.predicate && edge.`object` == pathEdge.`object`))) {
          throw new IllegalArgumentException("path edge is not one of the graph edges")
        }
      }
      path
    })
  }
}
