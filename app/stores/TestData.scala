package stores

import java.io.InputStreamReader

import formats.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.path.PathJsonlReader
import models.cskg.{Edge, Node}
import models.path.Path
import org.slf4j.LoggerFactory

import scala.collection.mutable
import scala.io.Source

object TestData {
  private val logger = LoggerFactory.getLogger(getClass)
  private val nodesById = deduplicateNodes(sortNodes(readNodes()))
  val nodes = nodesById.values.toList
  val edges = sortEdges(checkDanglingEdges(checkDuplicateEdges(readEdges()), nodesById))
  val edgesBySubjectId = edges.groupBy(edge => edge.subject)
  val edgesByObjectId = edges.groupBy(edge => edge.`object`)
  val paths = validatePaths(edges, nodesById, readPaths())

  private def checkDuplicateEdges(edges: List[Edge]): List[Edge] = {
    // Default toMap duplicate handling = use later key
    val deduplicatedEdges = edges.map(edge => ((edge.subject, edge.predicate, edge.`object`) -> edge)).toMap.values.toList
    if (deduplicatedEdges.size != edges.size) {
      throw new IllegalArgumentException(s"${edges.size - deduplicatedEdges.size} duplicate edges")
    }
    edges
  }

  private def deduplicateNodes(nodes: List[Node]): Map[String, Node] =
    nodes.map(node => (node.id, node)).toMap

  private def readEdges(): List[Edge] = {
    val inputStream = getClass.getResourceAsStream("/test_data/edges.csv.bz2")
    try {
      new CskgEdgesCsvReader().readCompressed(inputStream).toList
    } finally {
      inputStream.close()
    }
  }

  private def readNodes(): List[Node] = {
    val inputStream = getClass.getResourceAsStream("/test_data/nodes.csv.bz2")
    try {
      new CskgNodesCsvReader().readCompressed(inputStream).toList
    } finally {
      inputStream.close()
    }
  }

  private def readPaths(): List[Path] = {
    val inputStream = getClass.getResourceAsStream("/test_data/paths.jsonl")
    try {
      new PathJsonlReader().read(Source.fromInputStream(inputStream, "UTF-8")).toList
    } finally {
      inputStream.close()
    }
  }

  private def checkDanglingEdges(edges: List[Edge], nodesById: Map[String, Node]): List[Edge] = {
    val nonDanglingEdges = edges.filter(edge => nodesById.contains(edge.subject) && nodesById.contains(edge.`object`))
    if (nonDanglingEdges.size != edges.size) {
      throw new IllegalArgumentException(s"${edges.size - nonDanglingEdges.size} dangling edges")
    }
    edges
  }

  private def sortNodes(nodes: List[Node]) =
    nodes.sortBy(node => node.id)

  private def sortEdges(edges: List[Edge]) =
    edges.sortBy(edge => (edge.subject, edge.predicate, edge.`object`))

  private def validatePaths(edges: List[Edge], nodesById: Map[String, Node], paths: List[Path]): List[Path] = {
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
