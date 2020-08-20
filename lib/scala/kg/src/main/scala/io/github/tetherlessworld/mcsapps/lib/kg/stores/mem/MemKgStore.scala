package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import com.outr.lucene4s._
import com.outr.lucene4s.facet.FacetField
import com.outr.lucene4s.query._
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgPath, KgSource}
import io.github.tetherlessworld.mcsapps.lib.kg.stores._

import scala.util.Random

class MemKgStore extends KgCommandStore with KgQueryStore {
  private class MemKgCommandStoreTransaction extends KgCommandStoreTransaction {
    final override def clear(): Unit = {
      edges = List()
      lucene.deleteAll()
      nodes = List()
      nodesById = Map()
      paths = List()
      pathsById = Map()
      sourcesById = Map()
    }

    override def close(): Unit = {
      writeNodePageRanks

      lucene.deleteAll()
      MemKgStore.this.nodes.foreach(node => {
        lucene.doc().facets(node.sourceIds.map(LuceneFields.nodeSource(_)):_*).fields(LuceneFields.nodeId(node.id), LuceneFields.nodeLabels(node.labels.mkString(" ")), LuceneFields.nodeSources(node.sourceIds.mkString(" ")), LuceneFields.nodePageRank(node.pageRank.get)).index()
      })
      lucene.commit()
    }

    final override def putEdges(edges: Iterator[KgEdge]): Unit = {
      MemKgStore.this.edges = edges.toList
      putSourceIds(MemKgStore.this.edges.flatMap(_.sources).distinct)
    }

    final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit = {
      val edgesWithNodesList = edgesWithNodes.toList
      val uniqueEdges = edgesWithNodesList.map(edgeWithNodes => (edgeWithNodes.edge.id, edgeWithNodes.edge)).toMap.values.toList
      val uniqueNodes = edgesWithNodesList.flatMap(edgeWithNodes => List((edgeWithNodes.node1.id, edgeWithNodes.node1), (edgeWithNodes.node2.id, edgeWithNodes.node2))).toMap.values.toList
      putNodes(uniqueNodes)
      putEdges(uniqueEdges)
    }

    final override def putNodes(nodes: Iterator[KgNode]): Unit = {
      MemKgStore.this.nodes = nodes.toList
      MemKgStore.this.nodesById = MemKgStore.this.nodes.map(node => (node.id, node)).toMap
      putSourceIds(MemKgStore.this.nodes.flatMap(_.sourceIds).distinct)
    }

    final override def putPaths(paths: Iterator[KgPath]): Unit = {
      MemKgStore.this.paths = paths.toList
      MemKgStore.this.pathsById = MemKgStore.this.paths.map(path => (path.id, path)).toMap
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

    private def writeNodePageRanks: Unit = {
      MemKgStore.this.nodes = KgNodePageRankCalculator(MemKgStore.this.nodes, MemKgStore.this.edges)
      MemKgStore.this.nodesById = MemKgStore.this.nodes.map(node => (node.id, node)).toMap
    }
  }

  private var edges: List[KgEdge] = List()
  private val lucene = new DirectLucene(List("sources", "id", "labels"), autoCommit = false)
  private object LuceneFields {
    val nodeId = lucene.create.field[String]("id", fullTextSearchable = true)
    val nodeLabels = lucene.create.field[String]("labels", fullTextSearchable = true)
    val nodeSources = lucene.create.field[String]("sources")
    val nodePageRank = lucene.create.field[Double]("pageRank")
    val nodeSource = lucene.create.facet("source", multiValued = true)
  }
  private var nodes: List[KgNode] = List()
  private var nodesById: Map[String, KgNode] = Map()
  private var paths: List[KgPath] = List()
  private var pathsById: Map[String, KgPath] = Map()
  private val random = new Random()
  private var sourcesById: Map[String, KgSource] = Map()

  private def getLuceneField(sortableField: KgNodeSortableField) =
    sortableField match {
      case KgNodeSortableField.PageRank => LuceneFields.nodePageRank
      case KgNodeSortableField.Sources => LuceneFields.nodeSources
      case KgNodeSortableField.Labels => LuceneFields.nodeLabels
      case KgNodeSortableField.Id => LuceneFields.nodeId
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
//  private def filterNodes(filters: StringFacetFilter, nodes: List[Node], nodePropertyGetter: (Node) => String): List[Node] =
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

  final override def getMatchingNodeFacets(query: KgNodeQuery): KgNodeFacets = {
    val results = lucene.query().filter(toSearchTerms(query):_*).facet(LuceneFields.nodeSource, limit = 100).search()
    // The facet result also has a count per value, which we're ignoring
    KgNodeFacets(
      sources = results.facet(LuceneFields.nodeSource).map(_.values.map(_.value).map(sourceId => sourcesById(sourceId)).toList).getOrElse(List())
    )
  }

  final override def getMatchingNodes(limit: Int, offset: Int, query: KgNodeQuery, sorts: Option[List[KgNodeSort]]): List[KgNode] = {
    val querySorts = sorts.getOrElse(List()).map(sort => FieldSort(getLuceneField(sort.field), sort.direction == SortDirection.Descending))
    val results: PagedResults[SearchResult] = lucene.query().filter(toSearchTerms(query):_*).sort(querySorts:_*).limit(limit).offset(offset).search()
    results.results.toList.map(searchResult => nodesById(searchResult(LuceneFields.nodeId)))
  }

  final override def getMatchingNodesCount(query: KgNodeQuery): Int = {
    val results = lucene.query().filter(toSearchTerms(query):_*).search()
    results.total.intValue
  }

  override def getPathById(id: String): Option[KgPath] =
    pathsById.get(id)

  final override def getSourcesById: Map[String, KgSource] =
    sourcesById

  override def getRandomNode: KgNode =
    nodes(random.nextInt(nodes.size))

  final override def getTopEdgesByObject(limit: Int, objectNodeId: String): List[KgEdge] =
    edges.filter(_.`object` == objectNodeId).groupBy(_.predicate).mapValues(_.sortBy(edge => nodesById(edge.subject).pageRank.get)(Ordering[Double].reverse).take(limit)).values.flatten.toList

  final override def getTopEdgesBySubject(limit: Int, subjectNodeId: String): List[KgEdge] =
    edges.filter(_.subject == subjectNodeId).groupBy(_.predicate).mapValues(_.sortBy(edge => nodesById(edge.`object`).pageRank.get)(Ordering[Double].reverse).take(limit)).values.flatten.toList

  final override def getTotalEdgesCount: Int =
    edges.size

  final override def getTotalNodesCount: Int =
    nodes.size

  override def isEmpty: Boolean =
    edges.isEmpty && nodes.isEmpty && paths.isEmpty


  private def toSearchTerms(query: KgNodeQuery): List[SearchTerm] = {
    val textSearchTerm = query.text.map(text => string2ParsableSearchTerm(text)).getOrElse(MatchAllSearchTerm)
    if (query.filters.isDefined) {
      val filterSearchTerms = toSearchTerms(query.filters.get)
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
    nodeFilters.sourceIds.map(source => toSearchTerms(LuceneFields.nodeSource, source)).getOrElse(List())
  }

  private def toSearchTerms(field: FacetField, stringFilter: StringFacetFilter): List[(SearchTerm, Condition)] = {
    stringFilter.exclude.getOrElse(List()).map(exclude => drillDown(field(exclude)) -> Condition.MustNot) ++
    stringFilter.include.getOrElse(List()).map(include => drillDown(field(include)) -> Condition.Must)
  }

  final override def beginTransaction: KgCommandStoreTransaction =
    new MemKgCommandStoreTransaction
}
