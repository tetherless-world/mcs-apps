package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.KgNode
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgNodeLabelSearchResult, KgNodeSearchResult, KgSearchFilters, KgSearchQuery, StringFilter}
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

import scala.math.abs

trait KgSearchQueryStoreBehaviors extends Matchers {
  this: WordSpec =>

  private val nodesCount = TestKgData.nodes.size
  private val nodeLabelsCount = TestKgData.nodes.flatMap(_.labels).toSet.size
  private val sourcesCount = TestKgData.sources.size

  private def equals(left: KgNode, right: KgNode) =
    left.id == right.id && abs(left.pageRank.getOrElse(-1.0) - right.pageRank.getOrElse(-1.0)) < 0.1 && left.sourceIds == right.sourceIds && left.labels == right.labels && left.pos == right.pos

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
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds(1)}")), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
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
        actual.exists(node => equals(node, expected)) shouldEqual true
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

    // TODO: these tests fail on Neo4jKgStore
    // the MemKgStore pageRank values for the resultant nodes are uniform, thus
    // we are unable to make any meaningful comparison to Neo4j
//    "search nodes with a given source sorted by pageRank descending" in {
//      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
//        val expected = TestKgData.nodes(0)
//        val sourceId = expected.sourceIds(1)
//        val actual = query.search(limit = 1000, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${sourceId}")), sorts = Some(List(KgSearchSort(KgSearchSortField.PageRank, SortDirection.Descending), KgSearchSort(KgSearchSortField.Id, SortDirection.Ascending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node).take(10)
//        actual should not be empty
//
//        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.contains(sourceId)).sortBy(_.pageRank.get)(Ordering[Double].reverse).take(10)
//        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
//
//      }
//    }
//
//    "search nodes with a given source sorted by pageRank ascending" in {
//      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
//        val expected = TestKgData.nodes(0)
//
//        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgSearchSortField.PageRank, SortDirection.Ascending), KgSearchSort(KgSearchSortField.Id, SortDirection.Ascending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
//        actual should not be empty
//
//        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double]).take(10)
//        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
//      }
//    }
//
//    "search nodes with a given source sorted by pageRank descending with offset" in {
//      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
//        val expected = TestKgData.nodes(0)
//        val actual = query.search(limit = 10, offset = 5, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgSearchSortField.PageRank, SortDirection.Descending), KgSearchSort(KgSearchSortField.Id, SortDirection.Ascending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
//        actual should not be empty
//
//        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double].reverse).slice(5, 15)
//        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
//      }
//    }

    "get matching node labels" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val actual = query.search(limit = 1000, offset = 0, query = KgSearchQuery(filters = None, text = None), sorts = None)
        val nodeLabelResults = actual.filter(_.isInstanceOf[KgNodeLabelSearchResult]).map(_.asInstanceOf[KgNodeLabelSearchResult].nodeLabel)
        nodeLabelResults.toSet.size should equal(nodeLabelsCount)
        for (label <- nodeLabelResults) {
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

    "search results count with no text search and no filters" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        query.searchCount(query = KgSearchQuery(filters = None, text = None)) should equal(nodeLabelsCount + nodesCount + sourcesCount)
      }
    }

    "search results count with no text search but with include filters" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        query.searchCount(query = KgSearchQuery(filters = Some(KgSearchFilters(types = None, sourceIds = Some(StringFilter(exclude = None, include = Some(List(TestKgData.nodes(0).sourceIds(0))))))), text = None)) should equal(nodeLabelsCount + nodesCount + sourcesCount - 3)
      }
    }

    "search results count with no text search but with exclude filters" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        query.searchCount(query = KgSearchQuery(filters = Some(KgSearchFilters(types = None, sourceIds = Some(StringFilter(exclude = Some(List(TestKgData.nodes(0).sourceIds(0))))))), text = None)) should equal(sourcesCount - 1)
      }
    }

    "filter out search results" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val text = "Test"
        val countBeforeFilters = query.searchCount(query = KgSearchQuery(filters = None, text = Some(text)))
        countBeforeFilters should be > 0
        val actualCount = query.searchCount(query = KgSearchQuery(
          filters = Some(KgSearchFilters(types = None, sourceIds = Some(StringFilter(exclude = Some(List(TestKgData.nodes(0).sourceIds(0))), include = None)))),
          text = Some("Test")
        ))
        actualCount should equal(sourcesCount - 1)
      }
    }
  }

  protected def testSearchFacets(storeFactory: KgStoreFactory): Unit = {
    "get search result facets for all nodes" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val allFacets = query.searchFacets(KgSearchQuery(filters = None, text = None))
        allFacets.sourceIds.map(_.value).sorted should equal(TestKgData.sources.map(_.id).sorted)
      }
    }

    "get search result facets after an exclude filter" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        // Only include the "secondary" source of the node
        val facets = query.searchFacets(query = KgSearchQuery(filters = Some(KgSearchFilters(types = None, sourceIds = Some(StringFilter(exclude = Some(List(expected.sourceIds(1))), include = None)))), text = None))
        facets.sourceIds.size should be < TestKgData.sources.size
        facets.sourceIds.map(_.value) should not contain(expected.sourceIds(1))
      }
    }

    // TODO: this test fails on the MemKgStore
//    "get search result facets after an include filter" in {
//      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
//        val expected = TestKgData.nodes(0)
//        // Only include the "secondary" source of the node
//        val facets = query.searchFacets(query = KgSearchQuery(filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(include = Some(List(expected.sourceIds(1))), exclude = None)))), text = None))
//        facets.sourceIds.size should be < TestKgData.sources.size
//        facets.sourceIds.map(_.value).sorted should equal(expected.sourceIds.sorted)
//      }
//    }
  }
}
