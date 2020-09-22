package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import com.outr.lucene4s.facet.{FacetField, FacetValue}
import com.outr.lucene4s.field.value.FieldAndValue
import com.outr.lucene4s.query._
import com.outr.lucene4s.{DirectLucene, any, drillDown, grouped, string2ParsableSearchTerm}
import io.github.tetherlessworld.mcsapps.lib.kg.models.SortDirection
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeLabel}
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgNodeLabelSearchResult, KgNodeSearchResult, KgSearchFacets, KgSearchFilters, KgSearchQuery, KgSearchResult, KgSearchResultType, KgSearchResultTypeFacet, KgSearchResultTypeFilter, KgSearchSort, KgSearchSortField, KgSourceSearchResult, StringFacet, StringFilter}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores._

import scala.annotation.tailrec

final class MemKgIndex {
  private object LuceneFields {
    val id = lucene.create.field[String]("id", fullTextSearchable = true)
    // TODO: boost label since it corresponds to a node label document
    val label = lucene.create.field[String]("label", fullTextSearchable = true)
    val labels = lucene.create.field[String]("labels", fullTextSearchable = true)
    val pageRank = lucene.create.field[Double]("pageRank")
    val sources = lucene.create.field[String]("sources")
    val `type` = lucene.create.field[String]("type")
  }
  private object LuceneFacets {
    val source = lucene.create.facet("source", multiValued = true)
    val `type` = lucene.create.facet("type")
  }

  private sealed trait KgDocument {
    def facets: List[FacetValue]
    def fields: List[FieldAndValue[_]]
  }

  private final implicit class KgNodeDocument(node: KgNode) extends KgDocument {
    final override def facets: List[FacetValue] = List(LuceneFacets.`type`(KgNodeDocument.Type)) ++ node.sourceIds.map(LuceneFacets.source(_))
    final override def fields: List[FieldAndValue[_]] =
      List(
        LuceneFields.id(node.id),
        LuceneFields.labels(node.labels.mkString(" ")),
        LuceneFields.pageRank(node.pageRank.get),
        LuceneFields.sources(node.sourceIds.mkString(" ")),
        LuceneFields.`type`(KgNodeDocument.Type)
      )
  }

  private object KgNodeDocument {
    val Type = KgSearchResultType.Node.value
  }

  private final class KgNodeLabelDocument(nodeLabel: KgNodeLabel) extends KgDocument {
    private val sourceIds = nodeLabel.nodes.flatMap(_.sourceIds).toSet

    final override def facets: List[FacetValue] = List(LuceneFacets.`type`(KgNodeLabelDocument.Type)) ++ sourceIds.map(LuceneFacets.source(_))
    final override def fields: List[FieldAndValue[_]] =
      List(
        LuceneFields.label(nodeLabel.nodeLabel),
        LuceneFields.labels(nodeLabel.nodeLabel),
        LuceneFields.pageRank(nodeLabel.pageRank.get),
        LuceneFields.sources(sourceIds.mkString(" ")),
        LuceneFields.`type`(KgNodeLabelDocument.Type)
      )
  }

  private object KgNodeLabelDocument {
    val Type = KgSearchResultType.NodeLabel.value
  }

  private final class KgSourceDocument(source: KgSource) extends KgDocument {
    final override def facets: List[FacetValue] = List(LuceneFacets.`type`(KgSourceDocument.Type), LuceneFacets.source(source.id))
    final override def fields: List[FieldAndValue[_]] =
      List(
        LuceneFields.label(source.label),
        LuceneFields.labels(source.label),
        LuceneFields.sources(source.id),
        LuceneFields.`type`(KgSourceDocument.Type)
      )
  }

  private object KgSourceDocument {
    val Type = KgSearchResultType.Source.value
  }

  private val lucene = new DirectLucene(List("id"), autoCommit = false)
  private var nodesById: Map[String, KgNode] = Map()

  private def addLuceneSearchFacets(filters: Option[KgSearchFilters], queryBuilder: QueryBuilder[SearchResult]): QueryBuilder[SearchResult] =
    // "Include" filtering on facets apparently requires adding a .facet to the QueryBuilder
    // "Exclude" filtering on facets works with .filter SearchTerm's
    filters.foldLeft(queryBuilder)((queryBuilder, filters) => addLuceneSearchFacets(filters, queryBuilder))

  private def addLuceneSearchFacets(filters: KgSearchFilters, queryBuilder: QueryBuilder[SearchResult]): QueryBuilder[SearchResult] = {
    if (filters.sourceIds.isDefined) {
      addLuceneSearchFacets(LuceneFacets.source, queryBuilder, filters.sourceIds.get)
    } else {
      queryBuilder
    }
  }

  private def addLuceneSearchFacets(field: FacetField, queryBuilder: QueryBuilder[SearchResult], stringFilter: StringFilter): QueryBuilder[SearchResult] =
    stringFilter.include.getOrElse(List()).foldLeft(queryBuilder)((queryBuilder, include) => queryBuilder.facet(field, path = List(include)))

  final def clear(): Unit = {
    lucene.deleteAll()
  }

  private def getLuceneField(sortableField: KgSearchSortField) =
    sortableField match {
      case KgSearchSortField.PageRank => LuceneFields.pageRank
      case KgSearchSortField.Sources => LuceneFields.sources
      case KgSearchSortField.Labels => LuceneFields.labels
      case KgSearchSortField.Id => LuceneFields.id
    }

  final def index(nodesById: Map[String, KgNode], nodeLabelsByLabel: Map[String, KgNodeLabel], sourcesById: Map[String, KgSource]): Unit = {
    this.nodesById = nodesById

    def index(document: KgDocument) =
      lucene.doc().facets(document.facets: _*).fields(document.fields: _*).index()

    for (node <- nodesById.values) {
      index(node)
    }

    for (nodeLabel <- nodeLabelsByLabel.values) {
      index(new KgNodeLabelDocument(nodeLabel))
    }

    for (source <- sourcesById.values) {
      index(new KgSourceDocument(source))
    }

    lucene.commit()
  }

  final def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] = {
    val results = toKgSearchResults(lucene.query().filter(toLuceneSearchTerms(query):_*).sort(toLuceneFieldSorts(sorts):_*).search())
    results.drop(offset).take(limit)
  }

  final def searchCount(query: KgSearchQuery): Int = {
    val results = lucene.query().filter(toLuceneSearchTerms(query):_*).search()
    results.total.intValue
  }

  final def searchFacets(query: KgSearchQuery): KgSearchFacets = {
    val results = addLuceneSearchFacets(query.filters, lucene.query()).filter(toLuceneSearchTerms(query):_*).facet(LuceneFacets.source, limit = 100).search()
    // The facet result also has a count per value, which we're ignoring
    KgSearchFacets(
      sourceIds = results.facet(LuceneFacets.source).map(_.values.map(value => StringFacet(count = value.count, value = value.value)).toList).getOrElse(List()),
      types = results.facet(LuceneFacets.`type`).map(_.values.map(value => KgSearchResultTypeFacet(count = value.count, value = KgSearchResultType.values.find(_.value == value.value).get)).toList).getOrElse(List())
    )
  }

  private def toKgSearchResult(luceneResult: SearchResult): KgSearchResult = {
    val documentType: String = luceneResult(LuceneFields.`type`)
    documentType match {
      case KgNodeDocument.Type => {
        val nodeId = luceneResult(LuceneFields.id)
        KgNodeSearchResult(nodesById(nodeId))
      }
      case KgNodeLabelDocument.Type => {
        val nodeLabel = luceneResult(LuceneFields.label)
        val sourceIds = luceneResult(LuceneFields.sources).split(' ').toList
        KgNodeLabelSearchResult(nodeLabel = nodeLabel, sourceIds = sourceIds)
      }
      case KgSourceDocument.Type => {
        val sourceId = luceneResult(LuceneFields.sources)
//        val sourceLabel = luceneResult(LuceneFields.label)
        KgSourceSearchResult(sourceId)
      }
    }
  }

  private def toKgSearchResults(results: PagedResults[SearchResult]): List[KgSearchResult] =
    toKgSearchResults(List(), results)

  @tailrec
  private def toKgSearchResults(accumulated: List[KgSearchResult], results: PagedResults[SearchResult]): List[KgSearchResult] = {
    val toResults = results.results.toList.map(toKgSearchResult(_))
    val nextPage = results.nextPage()
    if (nextPage.isDefined) {
      toKgSearchResults(accumulated ++ toResults, nextPage.get)
    } else {
      accumulated ++ toResults
    }
  }

  private def toLuceneFieldSorts(sorts: Option[List[KgSearchSort]]) =
    sorts.getOrElse(List()).map(sort => FieldSort(getLuceneField(sort.field), sort.direction == SortDirection.Descending))

  private def toLuceneSearchTerms(query: KgSearchQuery): List[SearchTerm] = {
    var searchTerms: List[SearchTerm] = List()

    searchTerms ++= query.text.map(text => string2ParsableSearchTerm(text)).toList

    if (query.filters.isDefined) {
      val filterSearchTerms = toLuceneSearchTerms(query.filters.get)
      if (!filterSearchTerms.isEmpty) {
        searchTerms ++= List(grouped(filterSearchTerms: _*))
      }
    }

    searchTerms
  }

  private def toLuceneSearchTerms(filters: KgSearchFilters): List[(SearchTerm, Condition)] = {
    filters.sourceIds.map(toLuceneSearchTerms(LuceneFacets.source, _)).getOrElse(List()) ++
      filters.types.map(toLuceneSearchTerms(LuceneFacets.`type`, _)).getOrElse(List())
  }

  private def toLuceneSearchTerms(field: FacetField, filter: KgSearchResultTypeFilter): List[(SearchTerm, Condition)] = {
    filter.exclude.getOrElse(List()).map(exclude => drillDown(field(exclude.value)) -> Condition.MustNot) ++
      filter.include.getOrElse(List()).map(include => drillDown(field(include.value)) -> Condition.Must)
  }

  private def toLuceneSearchTerms(field: FacetField, filter: StringFilter): List[(SearchTerm, Condition)] = {
    filter.exclude.getOrElse(List()).map(exclude => drillDown(field(exclude)) -> Condition.MustNot) ++
      filter.include.getOrElse(List()).map(include => drillDown(field(include)) -> Condition.Must)
  }
}
