package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgNode
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

import scala.math.abs

trait KgSearchQueryStoreBehaviors extends Matchers {
  this: WordSpec =>

  private def equals(left: KgNode, right: KgNode) =
    left.id == right.id && abs(left.pageRank.getOrElse(-1.0) - right.pageRank.getOrElse(-1.0)) < 0.1 && left.sourceIds == right.sourceIds && left.labels == right.labels && left.pos == right.pos

  private val KgEdgesSortByIdAsc = KgEdgesSort(KgEdgesSortField.Id, SortDirection.Ascending)

  protected def testSearch(storeFactory: KgStoreFactory): Unit = {
    "search fulltext for a label" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(expected.labels(0))), sorts = None)
        actual should not be empty
        //        equals(actual(0), expected) shouldEqual true
      }
    }

    "search nodes with a source" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty
        actual(0).sourceIds should equal(expected.sourceIds)
      }
    }

    "not return search results for a non-extant source" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:nonextant")), sorts = None)
        actual.size should be(0)
      }
    }

    "search nodes with a given source and label" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"""sources:${expected.sourceIds(0)} labels:"${expected.labels(0)}"""")), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty
        equals(actual(0), expected) shouldEqual true
      }
    }

    "search nodes with a given id" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"""id:"${expected.id}"""")), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual.size should be(1)
        equals(actual(0), expected) shouldEqual true
      }
    }

    "search nodes with a given source sorted by pageRank descending" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgSearchSortField.PageRank, SortDirection.Descending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty

        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double].reverse).take(10)
        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
      }
    }

    "search nodes with a given source sorted by pageRank ascending" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)

        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgSearchSortField.PageRank, SortDirection.Ascending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty

        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double]).take(10)
        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
      }
    }

    "search nodes with a given source sorted by pageRank descending with offset" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 5, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgSearchSortField.PageRank, SortDirection.Descending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty

        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double].reverse).slice(5, 15)
        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
      }
    }

    "get matching node labels" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = None), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeLabelSearchResult].nodeLabel)
        actual.size should equal(10)
        actual.toSet.size should equal(actual.size)
        for (label <- actual) {
          label should not be empty
        }
      }
    }
  }

  protected def testSearchCount(storeFactory: KgStoreFactory): Unit = {
    "get count of search results with a label" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.searchCount(query = KgSearchQuery(filters = None, text = Some(expected.labels(0))))
        actual should be >= 1
      }
    }

    "search nodes count with no text search and no filters" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        query.searchCount(query = KgSearchQuery(filters = None, text = None)) should equal(TestKgData.nodes.size)
      }
    }

    "search nodes count with no text search but with filters" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        query.searchCount(query = KgSearchQuery(filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(exclude = None, include = Some(List(TestKgData.nodes(0).sourceIds(0))))))), text = None)) should equal(TestKgData.nodes.size)
        query.searchCount(query = KgSearchQuery(filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(exclude = Some(List(TestKgData.nodes(0).sourceIds(0))))))), text = None)) should equal(0)
      }
    }

    "filter out search results" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val text = "Test"
        val countBeforeFilters = query.searchCount(query = KgSearchQuery(filters = None, text = Some(text)))
        countBeforeFilters should be > 0
        val actualCount = query.searchCount(query = KgSearchQuery(
          filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(exclude = Some(List(TestKgData.nodes(0).sourceIds(0))), include = None)))),
          text = Some("Test")
        ))
        actualCount should equal(0)
      }
    }
  }

  protected def testSearchFacets(storeFactory: KgStoreFactory): Unit = {
    "get search result facets for all nodes" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val allFacets = query.searchFacets(KgSearchQuery(filters = None, text = None))
        allFacets.sourceIds.sortBy(_.value) should equal(TestKgData.sources.sortBy(_.id).map(_.id))
      }
    }

    "get search result facets for filtered nodes" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val facets = query.searchFacets(query = KgSearchQuery(filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(include = Some(expected.sourceIds), exclude = None)))), text = None))
        facets.sourceIds.size should be < TestKgData.sources.size
        facets.sourceIds.sortBy(_.value).map(_.value) should equal(expected.sourceIds.sortBy(sourceId => sourceId))
      }
    }
  }
}
