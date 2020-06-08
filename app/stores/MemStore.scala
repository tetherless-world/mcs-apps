package stores

import com.outr.lucene4s._
import com.outr.lucene4s.field.Field
import com.outr.lucene4s.query.{Condition, GroupedSearchTerm, SearchTerm}
import models.cskg.{Edge, Node}

import scala.util.Random

class MemStore(val edges: List[Edge], val nodes: List[Node]) extends Store {
  private val lucene = new DirectLucene(List("datasource", "id", "label"))
  private val luceneNodeDatasourceField = lucene.create.field[String]("datasource", fullTextSearchable = true)
  private val luceneNodeIdField = lucene.create.field[String]("id", fullTextSearchable = true)
  private val luceneNodeLabelField = lucene.create.field[String]("label", fullTextSearchable = true)
  nodes.foreach(node => {
    lucene.doc().fields(luceneNodeDatasourceField(node.datasource), luceneNodeIdField(node.id), luceneNodeLabelField(node.label)).index()
  })
  private val nodesById = nodes.map(node => (node.id, node)).toMap
  private val random = new Random()
  private val datasources = nodes.flatMap(_.datasource.split(",")).distinct

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

  override def getRandomNode: Node =
    nodes(random.nextInt(nodes.size))

  final override def getTotalEdgesCount: Int =
    edges.size

  final override def getTotalNodesCount: Int =
    nodes.size

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

  private def toSearchTerms(filters: NodeFilters): List[(SearchTerm, Condition)] = {
    filters.datasource.map(datasource => toSearchTerms(luceneNodeDatasourceField, datasource)).getOrElse(List())
  }

  private def toSearchTerms(field: Field[String], stringFilter: StringFilter): List[(SearchTerm, Condition)] = {
    stringFilter.exclude.getOrElse(List()).map(exclude => term(field(exclude)) -> Condition.MustNot) ++
    stringFilter.include.getOrElse(List()).map(include => term(field(include)) -> Condition.Must)
  }
}
