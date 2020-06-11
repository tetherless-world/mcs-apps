package stores

import com.outr.lucene4s._
import com.outr.lucene4s.field.Field
import com.outr.lucene4s.query.{Condition, GroupedSearchTerm, SearchTerm}
import models.cskg.{Edge, Node}
import models.path.Path

import scala.util.Random

class MemStore extends Store {
  private var edges: List[Edge] = List()
  private val lucene = new DirectLucene(List("datasource", "id", "label"), autoCommit = false)
  private val luceneNodeDatasourceField = lucene.create.field[String]("datasource", fullTextSearchable = true)
  private val luceneNodeIdField = lucene.create.field[String]("id", fullTextSearchable = true)
  private val luceneNodeLabelField = lucene.create.field[String]("label", fullTextSearchable = true)
  private var nodes: List[Node] = List()
  private var nodesById: Map[String, Node] = Map()
  private var paths: List[Path] = List()
  private var pathsById: Map[String, Path] = Map()
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

  final override def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[Edge] =
    edges.filter(edge => edge.`object` == objectNodeId).drop(offset).take(limit)

  final override def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[Edge] =
    edges.filter(edge => edge.subject == subjectNodeId).drop(offset).take(limit)

  final override def getNodeById(id: String): Option[Node] =
    nodesById.get(id)

  final override def getMatchingNodes(filters: Option[NodeFilters], limit: Int, offset: Int, text: String): List[Node] = {
    val results = lucene.query().filter(toSearchTerms(filters, text):_*).limit(limit).offset(offset).search()
    results.results.toList.map(searchResult => nodesById(searchResult(luceneNodeIdField)))
  }

  final override def getMatchingNodesCount(filters: Option[NodeFilters], text: String): Int = {
    val results = lucene.query().filter(toSearchTerms(filters, text):_*).search()
    results.total.intValue
  }

  final override def getPaths =
    paths

  override def getPathById(id: String): Option[Path] =
    pathsById.get(id)

  override def getRandomNode: Node =
    nodes(random.nextInt(nodes.size))

  final override def getTotalEdgesCount: Int =
    edges.size

  final override def getTotalNodesCount: Int =
    nodes.size

  override def isEmpty: Boolean =
    edges.isEmpty && nodes.isEmpty && paths.isEmpty

  final override def putEdges(edges: TraversableOnce[Edge]): Unit = {
    this.edges = edges.toList
  }

  final override def putNodes(nodes: TraversableOnce[Node]): Unit = {
    this.nodes = nodes.toList
    this.nodesById = this.nodes.map(node => (node.id, node)).toMap
    this.datasources = this.nodes.flatMap(_.datasource.split(",")).distinct
    lucene.deleteAll()
    this.nodes.foreach(node => {
      lucene.doc().fields(luceneNodeDatasourceField(node.datasource), luceneNodeIdField(node.id), luceneNodeLabelField(node.label)).index()
    })
    lucene.commit()
  }


  override def putPaths(paths: TraversableOnce[Path]): Unit = {
    this.paths = paths.toList
    this.pathsById = this.paths.map(path => (path.id, path)).toMap
  }

  private def toSearchTerms(filters: Option[NodeFilters], text: String): List[SearchTerm] = {
    val textSearchTerm = string2ParsableSearchTerm(text)
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

  private def toSearchTerms(nodeFilters: NodeFilters): List[(SearchTerm, Condition)] = {
    nodeFilters.datasource.map(datasource => toSearchTerms(luceneNodeDatasourceField, datasource)).getOrElse(List())
  }

  private def toSearchTerms(field: Field[String], stringFilter: StringFilter): List[(SearchTerm, Condition)] = {
    stringFilter.exclude.getOrElse(List()).map(exclude => term(field(exclude)) -> Condition.MustNot) ++
    stringFilter.include.getOrElse(List()).map(include => term(field(include)) -> Condition.Must)
  }
}
