package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import com.outr.lucene4s._
import com.outr.lucene4s.facet.FacetField
import com.outr.lucene4s.query._
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgPath, KgSource}
import io.github.tetherlessworld.mcsapps.lib.kg.stores._

import scala.annotation.tailrec
import scala.collection.mutable
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
      putSourceIds(MemKgStore.this.edges.flatMap(_.sourceIds).distinct)
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

  final override def beginTransaction: KgCommandStoreTransaction =
    new MemKgCommandStoreTransaction

  private def getLuceneField(sortableField: KgSearchSortField) =
    sortableField match {
      case KgSearchSortField.PageRank => LuceneFields.nodePageRank
      case KgSearchSortField.Sources => LuceneFields.nodeSources
      case KgSearchSortField.Labels => LuceneFields.nodeLabels
      case KgSearchSortField.Id => LuceneFields.nodeId
    }

  final override def getTopEdges(filters: KgEdgeFilters, limit: Int, sort: KgEdgeSortField): List[KgEdge] = {
    var edges = this.edges
    if (filters.subjectId.isDefined) {
      edges = edges.filter(_.subject == filters.subjectId.get)
    }
    if (filters.subjectLabel.isDefined) {
      edges = edges.filter(edge => nodesById(edge.subject).labels.contains(filters.subjectLabel.get))
    }
    sort match {
      case KgEdgeSortField.ObjectPageRank =>
        // Group edges by predicate and take the top <limit> edges within each predicate group
        edges.groupBy(_.predicate).mapValues(_.sortBy(edge => nodesById(edge.subject).pageRank.get)(Ordering[Double].reverse).take(limit)).values.flatten.toList
      case KgEdgeSortField.ObjectLabelPageRank => {
        // Group edges by predicate
        edges.groupBy(_.predicate).mapValues(edgesWithPredicate => {
          // Group edges by object label
          // Since a node can have multiple labels, the same edge can be in multiple groups
          // Each group should only have one reference to a unique edge, however, so we use a map.
          val edgesByObjectLabels = new mutable.HashMap[String, mutable.HashMap[String, KgEdge]]
          for (edge <- edgesWithPredicate) {
            for (objectLabel <- nodesById(edge.`object`).labels) {
              edgesByObjectLabels.getOrElseUpdate(objectLabel, new mutable.HashMap[String, KgEdge])(edge.id) = edge
            }
          }
          // Calculate the PageRank of each object label group
          // Take the top <limit> groups by PageRank and return all of the edges in each group (i.e., all edges with the same label)
          edgesByObjectLabels.map({ case (objectLabel, edgesById) =>
            // Label page rank = max of the constituent node page ranks
            val objectLabelPageRank = edgesById.values.map(edge => nodesById(edge.`object`).pageRank.get).max(Ordering[Double])
            (edgesById.values, objectLabelPageRank)
          }).toList.sortBy(_._2).take(limit).map(_._1).flatten
        }).values.flatten.toList
      }
    }
  }

  final override def getNodeById(id: String): Option[KgNode] =
    nodesById.get(id)

  final override def getNodesByLabel(label: String): List[KgNode] =
    nodes.filter(node => node.labels.contains(label))

  final override def getPathById(id: String): Option[KgPath] =
    pathsById.get(id)

  final override def getSourcesById: Map[String, KgSource] =
    sourcesById

  final override def getRandomNode: KgNode =
    nodes(random.nextInt(nodes.size))

  final override def getTotalEdgesCount: Int =
    edges.size

  final override def getTotalNodesCount: Int =
    nodes.size

  override def isEmpty: Boolean =
    edges.isEmpty && nodes.isEmpty && paths.isEmpty

  private def luceneResultsToNodes(results: PagedResults[SearchResult]): List[KgNode] =
    luceneResultsToNodes(List(), results)

  @tailrec
  private def luceneResultsToNodes(accumulatedNodes: List[KgNode], results: PagedResults[SearchResult]): List[KgNode] = {
    val resultsNodes = results.results.toList.map(searchResult => nodesById(searchResult(LuceneFields.nodeId)))
    val nextPage = results.nextPage()
    if (nextPage.isDefined) {
      luceneResultsToNodes(accumulatedNodes ++ resultsNodes, nextPage.get)
    } else {
      accumulatedNodes ++ resultsNodes
    }
  }

  final override def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] = {
    // Previous node-only search:
//    val results = lucene.query().filter(toLuceneSearchTerms(query):_*).sort(toLuceneFieldSorts(sorts):_*).limit(limit).offset(offset).search()
//    results.results.toList.map(searchResult => nodesById(searchResult(LuceneFields.nodeId)))

    // TODO: use result grouping
    // Need to build convert the lucene4s QueryBuilder to a Lucene Query (see QueryBuilder.scala) and then add a grouping on label
    // This has to be done before limit + offset so that a single group of nodes only counts as one toward the limit

    // For the time being just collect everything and fill the output until we reach the limit.
    val nodes = luceneResultsToNodes(lucene.query().filter(toLuceneSearchTerms(query):_*).sort(toLuceneFieldSorts(sorts):_*).search())
    val nodeLabels = nodes
      .flatMap(node => node.labels)
      .toSet
      .toList
      .drop(offset).take(limit)
    // Just use all source id's for now
    nodeLabels.map(KgNodeLabelSearchResult(_, sourceIds = getSources.map(_.id)))

    // TODO: return other search result types e.g., fulltext on source labels, for example
    // This will require reworking the Lucene index to allow documents to represent nodes, edges, sources, and labels
  }

  final override def searchCount(query: KgSearchQuery): Int = {
    val results = lucene.query().filter(toLuceneSearchTerms(query):_*).search()
    results.total.intValue
  }

  final override def searchFacets(query: KgSearchQuery): KgSearchFacets = {
    val results = lucene.query().filter(toLuceneSearchTerms(query):_*).facet(LuceneFields.nodeSource, limit = 100).search()
    // The facet result also has a count per value, which we're ignoring
    KgSearchFacets(
      sourceIds = results.facet(LuceneFields.nodeSource).map(_.values.map(value => StringFacetValue(count = value.count, value = value.value)).toList).getOrElse(List())
    )
  }

  private def toLuceneFieldSorts(sorts: Option[List[KgSearchSort]]) =
    sorts.getOrElse(List()).map(sort => FieldSort(getLuceneField(sort.field), sort.direction == SortDirection.Descending))

  private def toLuceneSearchTerms(query: KgSearchQuery): List[SearchTerm] = {
    val textSearchTerm = query.text.map(text => string2ParsableSearchTerm(text)).getOrElse(MatchAllSearchTerm)
    if (query.filters.isDefined) {
      val filterSearchTerms = toLuceneSearchTerms(query.filters.get)
      if (!filterSearchTerms.isEmpty) {
        List(textSearchTerm, grouped(filterSearchTerms:_*))
      } else {
        List(textSearchTerm)
      }
    }  else {
      List(textSearchTerm)
    }
  }

  private def toLuceneSearchTerms(nodeFilters: KgSearchFilters): List[(SearchTerm, Condition)] = {
    nodeFilters.sourceIds.map(source => toLuceneSearchTerms(LuceneFields.nodeSource, source)).getOrElse(List())
  }

  private def toLuceneSearchTerms(field: FacetField, stringFilter: StringFacetFilter): List[(SearchTerm, Condition)] = {
    stringFilter.exclude.getOrElse(List()).map(exclude => drillDown(field(exclude)) -> Condition.MustNot) ++
    stringFilter.include.getOrElse(List()).map(include => drillDown(field(include)) -> Condition.Must)
  }
}
