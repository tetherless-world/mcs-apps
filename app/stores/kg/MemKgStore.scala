package stores.kg

import com.outr.lucene4s._
import com.outr.lucene4s.field.Field
import com.outr.lucene4s.query.{Condition, MatchAllSearchTerm, SearchTerm}
import models.kg.{KgEdge, KgNode, KgPath}
import stores.StringFilter

import scala.util.Random

class MemKgStore extends KgStore {
  private var edges: List[KgEdge] = List()
  private val lucene = new DirectLucene(List("datasource", "id", "label"), autoCommit = false)
  private val luceneNodeDatasourceField = lucene.create.field[String]("datasource", fullTextSearchable = true)
  private val luceneNodeIdField = lucene.create.field[String]("id", fullTextSearchable = true)
  private val luceneNodeLabelField = lucene.create.field[String]("label", fullTextSearchable = true)
  private var nodes: List[KgNode] = List()
  private var nodesById: Map[String, KgNode] = Map()
  private var paths: List[KgPath] = List()
  private var pathsById: Map[String, KgPath] = Map()
  private val random = new Random()
  private var datasources: List[String] = List()

  final override def clear(): Unit = {
    datasources = List()
    edges = List()
    lucene.deleteAll()
    nodes = List()
    nodesById = Map()
    paths = List()
    pathsById = Map()
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

  final override def getDatasources: List[String] =
    this.datasources

  final override def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge] =
    edges.filter(edge => edge.`object` == objectNodeId).drop(offset).take(limit)

  final override def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge] =
    edges.filter(edge => edge.subject == subjectNodeId).drop(offset).take(limit)

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
  }

  final override def putNodes(nodes: Iterator[KgNode]): Unit = {
    this.nodes = nodes.toList
    this.nodesById = this.nodes.map(node => (node.id, node)).toMap
    this.datasources = this.nodes.flatMap(_.datasource.split(",")).distinct
    lucene.deleteAll()
    this.nodes.foreach(node => {
      lucene.doc().fields(luceneNodeDatasourceField(node.datasource), luceneNodeIdField(node.id), luceneNodeLabelField(node.label)).index()
    })
    lucene.commit()
  }

  override def putPaths(paths: Iterator[KgPath]): Unit = {
    this.paths = paths.toList
    this.pathsById = this.paths.map(path => (path.id, path)).toMap
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
    nodeFilters.datasource.map(datasource => toSearchTerms(luceneNodeDatasourceField, datasource)).getOrElse(List())
  }

  private def toSearchTerms(field: Field[String], stringFilter: StringFilter): List[(SearchTerm, Condition)] = {
    stringFilter.exclude.getOrElse(List()).map(exclude => term(field(exclude)) -> Condition.MustNot) ++
    stringFilter.include.getOrElse(List()).map(include => term(field(include)) -> Condition.Must)
  }
}
