package stores.kg.mem

import com.outr.lucene4s._
import com.outr.lucene4s.facet.FacetField
import com.outr.lucene4s.query.{Condition, MatchAllSearchTerm, SearchTerm}
import formats.kg.kgtk.KgtkEdgeWithNodes
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import stores.StringFilter
import stores.kg.{KgNodeFilters, KgStore}
import util.NodePageRankCalculator

import scala.annotation.tailrec
import scala.math.sqrt
import scala.util.Random

class MemKgStore extends KgStore {
  private var edges: List[KgEdge] = List()
  private val lucene = new DirectLucene(List("sources", "id", "labels"), autoCommit = false)
  private val luceneNodeSourceField = lucene.create.facet("source", multiValued = true)
  private val luceneNodeIdField = lucene.create.field[String]("id", fullTextSearchable = true)
  private val luceneNodeLabelsField = lucene.create.field[String]("labels", fullTextSearchable = true)
  private var nodes: List[KgNode] = List()
  private var nodesById: Map[String, KgNode] = Map()
  private var paths: List[KgPath] = List()
  private var pathsById: Map[String, KgPath] = Map()
  private val random = new Random()
  private var sourcesById: Map[String, KgSource] = Map()

  final override def clear(): Unit = {
    edges = List()
    lucene.deleteAll()
    nodes = List()
    nodesById = Map()
    paths = List()
    pathsById = Map()
    sourcesById = Map()
  }

//  private def filterNodes(filters: Option[NodeFilters], nodes: List[Node]): List[Node] =
//    if (filters.isDefined) {
//      filterNodes(filters.get, nodes)
//    } else {
//      nodes
//    }
//
//  private def filterNodes(filters: NodeFilters, nodes: List[Node]): List[Node] =
//    if (filters.datasource.isDefined) {
//      filterNodes(filters.datasource.get, nodes, node => node.datasource)
//    } else {
//      nodes
//    }
//
//  private def filterNodes(filters: StringFilter, nodes: List[Node], nodePropertyGetter: (Node) => String): List[Node] =
//    nodes.filter(node => {
//      val nodeProperty = nodePropertyGetter(node)
//      val excluded = filters.exclude.getOrElse(List()).exists(exclude => exclude == nodeProperty)
//      val included = filters.include.getOrElse(List()).exists(include => include == nodeProperty)
//      !excluded && (!filters.include.isDefined || included)
//    })

  final override def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge] =
    edges.filter(edge => edge.`object` == objectNodeId).sortBy(edge => nodesById(edge.subject).pageRank.get).drop(offset).take(limit)

  final override def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge] =
    edges.filter(edge => edge.subject == subjectNodeId).sortBy(edge => nodesById(edge.`object`).pageRank.get).drop(offset).take(limit)

  final override def getNodeById(id: String): Option[KgNode] =
    nodesById.get(id)

  final override def getMatchingNodes(filters: Option[KgNodeFilters], limit: Int, offset: Int, text: Option[String]): List[KgNode] = {
    val results = lucene.query().filter(toSearchTerms(filters, text):_*).limit(limit).offset(offset).search()
    results.results.toList.map(searchResult => nodesById(searchResult(luceneNodeIdField)))
  }

  final override def getMatchingNodesCount(filters: Option[KgNodeFilters], text: Option[String]): Int = {
    val results = lucene.query().filter(toSearchTerms(filters, text):_*).search()
    results.total.intValue
  }

  override def getPathById(id: String): Option[KgPath] =
    pathsById.get(id)

  final override def getSourcesById: Map[String, KgSource] =
    sourcesById

  override def getRandomNode: KgNode =
    nodes(random.nextInt(nodes.size))

  final override def getTotalEdgesCount: Int =
    edges.size

  final override def getTotalNodesCount: Int =
    nodes.size

  override def isEmpty: Boolean =
    edges.isEmpty && nodes.isEmpty && paths.isEmpty

  final override def putEdges(edges: Iterator[KgEdge]): Unit = {
    this.edges = edges.toList
    putSourceIds(this.edges.flatMap(_.sources).distinct)
  }

  final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit = {
    val edgesWithNodesList = edgesWithNodes.toList
    val uniqueEdges = edgesWithNodesList.map(edgeWithNodes => (edgeWithNodes.edge.id, edgeWithNodes.edge)).toMap.values.toList
    val uniqueNodes = edgesWithNodesList.flatMap(edgeWithNodes => List((edgeWithNodes.node1.id, edgeWithNodes.node1), (edgeWithNodes.node2.id, edgeWithNodes.node2))).toMap.values.toList
    putNodes(uniqueNodes)
    putEdges(uniqueEdges)
  }

  final override def putNodes(nodes: Iterator[KgNode]): Unit = {
    this.nodes = nodes.toList
    this.nodesById = this.nodes.map(node => (node.id, node)).toMap
    putSourceIds(this.nodes.flatMap(_.sources).distinct)
    lucene.deleteAll()
    this.nodes.foreach(node => {
      lucene.doc().facets(node.sources.map(luceneNodeSourceField(_)):_*).fields(luceneNodeIdField(node.id), luceneNodeLabelsField(node.labels.mkString(" "))).index()
    })
    lucene.commit()
  }

  final override def putPaths(paths: Iterator[KgPath]): Unit = {
    this.paths = paths.toList
    this.pathsById = this.paths.map(path => (path.id, path)).toMap
  }

  private def putSourceIds(sourceIds: List[String]): Unit =
    putSources(sourceIds.map(KgSource(_)))

  final override def putSources(sources: Iterator[KgSource]): Unit = {
    for (source <- sources) {
      if (!sourcesById.contains(source.id)) {
        sourcesById += (source.id -> source)
      }
    }
  }

  private def toSearchTerms(filters: Option[KgNodeFilters], text: Option[String]): List[SearchTerm] = {
    val textSearchTerm = text.map(text => string2ParsableSearchTerm(text)).getOrElse(MatchAllSearchTerm)
    if (filters.isDefined) {
      val filterSearchTerms = toSearchTerms(filters.get)
      if (!filterSearchTerms.isEmpty) {
        List(textSearchTerm, grouped(filterSearchTerms:_*))
      } else {
        List(textSearchTerm)
      }
    }  else {
      List(textSearchTerm)
    }
  }

  private def toSearchTerms(nodeFilters: KgNodeFilters): List[(SearchTerm, Condition)] = {
    nodeFilters.sources.map(source => toSearchTerms(luceneNodeSourceField, source)).getOrElse(List())
  }

  private def toSearchTerms(field: FacetField, stringFilter: StringFilter): List[(SearchTerm, Condition)] = {
    stringFilter.exclude.getOrElse(List()).map(exclude => drillDown(field(exclude)) -> Condition.MustNot) ++
    stringFilter.include.getOrElse(List()).map(include => drillDown(field(include)) -> Condition.Must)
  }

 final override def writeNodePageRanks() = {
    this.nodes = NodePageRankCalculator(this.nodes, this.edges)
    this.nodesById = this.nodes.map(node => (node.id, node)).toMap
  }
}
