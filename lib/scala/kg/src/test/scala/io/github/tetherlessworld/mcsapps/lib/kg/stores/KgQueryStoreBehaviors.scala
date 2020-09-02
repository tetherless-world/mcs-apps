package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgNode
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

import scala.math.abs

trait KgQueryStoreBehaviors extends Matchers with KgSearchQueryStoreBehaviors {
  this: WordSpec =>

  private def equals(left: KgNode, right: KgNode) =
    left.id == right.id && abs(left.pageRank.getOrElse(-1.0) - right.pageRank.getOrElse(-1.0)) < 0.1 && left.sourceIds == right.sourceIds && left.labels == right.labels && left.pos == right.pos

  private val KgEdgesSortByIdAsc = KgEdgesSort(KgEdgesSortField.Id, SortDirection.Ascending)

  private def testGetEdges(storeFactory: KgStoreFactory): Unit = {
    "get edges by object" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        for (node <- TestKgData.nodes) {
          val edges = query.getEdges(filters = KgEdgeFilters(objectId = Some(node.id)), limit = 1, offset = 0, sort = KgEdgesSortByIdAsc)
          edges.size should be(1)
          val edge = edges(0)
          edge.`object` should equal(node.id)
        }
      }
    }

    "page edges by object" in {
      val sut = storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val node = TestKgData.nodes(0)
        val expected = TestKgData.edges.filter(edge => edge.`object` == node.id).sortBy(edge => (edge.subject, edge.predicate))
        expected.size should be > 1
        val actual = (0 until expected.size).flatMap(offset => query.getEdges(filters = KgEdgeFilters(objectId = Some(node.id)), limit = 1, offset = offset, sort = KgEdgesSortByIdAsc)).sortBy(edge => (edge.subject, edge.predicate)).toList
        actual should equal(expected)
      }
    }

    "get edges by subject" in {
      val sut = storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val node = TestKgData.nodes(0)
        val edges = query.getEdges(filters = KgEdgeFilters(subjectId = Some(node.id)), limit = 1, offset = 0, sort = KgEdgesSortByIdAsc)
        edges.size should be(1)
        val edge = edges(0)
        edge.subject should equal(node.id)
      }
    }

    "page edges by subject" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val node = TestKgData.nodes(0)
        val expected = TestKgData.edges.filter(edge => edge.subject == node.id).sortBy(edge => (edge.predicate, edge.`object`))
        expected.size should be > 1
        val actual = (0 until expected.size).flatMap(offset => query.getEdges(filters = KgEdgeFilters(subjectId = Some(node.id)), limit = 1, offset = offset, sort = KgEdgesSortByIdAsc)).sortBy(edge => (edge.predicate, edge.`object`)).toList
        actual should equal(expected)
      }
    }
  }

  private def testGetNodeById(storeFactory: KgStoreFactory): Unit = {
    "get node by id" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.getNodeById(expected.id).get
        equals(actual, expected) shouldEqual true
      }
    }
  }

  private def testGetNodesByLabel(storeFactory: KgStoreFactory): Unit = {
    "get nodes by label" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.getNodesByLabel(expected.labels(0))
        actual.exists(_.id == expected.id) shouldEqual true
      }
    }
  }

  private def testGetPathById(storeFactory: KgStoreFactory): Unit = {
    "get a path by id" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.paths(0)
        query.getPathById(expected.id) should equal(Some(expected))
      }
    }

    "return None for a non-extant path" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        query.getPathById("nonextant") should equal(None)
      }
    }
  }

  private def testGetRandomNode(storeFactory: KgStoreFactory): Unit = {
    "get a random node" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = query.getRandomNode
        val actual = query.getNodeById(expected.id).get
        equals(actual, expected) shouldEqual true
      }
    }
  }

  private def testGetSources(storeFactory: KgStoreFactory): Unit = {
    "get sources" in {
      storeFactory(StoreTestMode.ReadWrite) { case (command, query) =>
        val expected = TestKgData.sources.sortBy(_.id)
        val actual = query.getSources.sortBy(_.id)
        actual should equal(expected)
      }
    }
  }

  private def testGetTopEdges(storeFactory: KgStoreFactory): Unit = {
    "get top edges by object node id" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val limit = 3
        val objectNodeId = TestKgData.nodes(0).id
        val actual = query.getTopEdges(filters = KgEdgeFilters(objectId = Some(objectNodeId)), limit = limit, sort = KgTopEdgesSort(KgTopEdgesSortField.ObjectPageRank, SortDirection.Descending))

        val objectEdges = TestKgData.edges.filter(_.`object` == objectNodeId)
        var partitionStart = 0
        for (partitionEnd <- 1 until actual.size + 1) {
          if (partitionEnd == actual.size || actual(partitionEnd).predicate != actual(partitionStart).predicate) {
            partitionEnd - partitionStart should be <= limit
            actual.slice(partitionStart, partitionEnd) should equal(objectEdges.filter(_.predicate == actual(partitionStart).predicate).sortBy(edge => TestKgData.nodesById(edge.subject).pageRank.get)(Ordering[Double].reverse).take(limit))

            partitionStart = partitionEnd
          }
        }
      }
    }

    "get top edges by subject node id" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val limit = 3
        val subjectNodeId = TestKgData.nodes(0).id
        val actual = query.getTopEdges(filters = KgEdgeFilters(subjectId = Some(subjectNodeId)), limit = limit, sort = KgTopEdgesSort(KgTopEdgesSortField.ObjectLabelPageRank, SortDirection.Descending))

        val subjectEdges = TestKgData.edges.filter(_.subject == subjectNodeId)
        var partitionStart = 0
        for (partitionEnd <- 1 until actual.size + 1) {
          if (partitionEnd == actual.size || actual(partitionEnd).predicate != actual(partitionStart).predicate) {
            partitionEnd - partitionStart should be <= limit
            actual.slice(partitionStart, partitionEnd) should equal(subjectEdges.filter(_.predicate == actual(partitionStart).predicate).sortBy(edge => TestKgData.nodesById(edge.`object`).pageRank.get)(Ordering[Double].reverse).take(limit))

            partitionStart = partitionEnd
          }
        }
      }
    }

    "get top edges by object node label" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val limit = 3
        val objectNodeLabel = TestKgData.nodes(0).labels(0)
        val actual = query.getTopEdges(filters = KgEdgeFilters(objectLabel = Some(objectNodeLabel)), limit = limit, sort = KgTopEdgesSort(KgTopEdgesSortField.ObjectLabelPageRank, SortDirection.Descending))

        val objectNodes = TestKgData.nodes.filter(_.labels.contains(objectNodeLabel))
        val objectEdges = TestKgData.edges.filter(edge => objectNodes.contains(TestKgData.nodesById(edge.`object`)))
        var partitionStart = 0
        for (partitionEnd <- 1 until actual.size + 1) {
          if (partitionEnd == actual.size || actual(partitionEnd).predicate != actual(partitionStart).predicate) {
            partitionEnd - partitionStart should be <= limit
            actual.slice(partitionStart, partitionEnd) should equal(objectEdges.filter(_.predicate == actual(partitionStart).predicate).sortBy(edge => TestKgData.nodesById(edge.subject).pageRank.get)(Ordering[Double].reverse).take(limit))

            partitionStart = partitionEnd
          }
        }
      }
    }

    "get top edges by subject node label" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val limit = 3
        val subjectNodeLabel = TestKgData.nodes(0).labels(0)
        val actual = query.getTopEdges(filters = KgEdgeFilters(subjectLabel = Some(subjectNodeLabel)), limit = limit, sort = KgTopEdgesSort(KgTopEdgesSortField.ObjectLabelPageRank, SortDirection.Descending))

        val subjectNodes = TestKgData.nodes.filter(_.labels.contains(subjectNodeLabel))
        val subjectEdges = TestKgData.edges.filter(edge => subjectNodes.contains(TestKgData.nodesById(edge.subject)))
        var partitionStart = 0
        for (partitionEnd <- 1 until actual.size + 1) {
          if (partitionEnd == actual.size || actual(partitionEnd).predicate != actual(partitionStart).predicate) {
            partitionEnd - partitionStart should be <= limit
            actual.slice(partitionStart, partitionEnd) should equal(subjectEdges.filter(_.predicate == actual(partitionStart).predicate).sortBy(edge => TestKgData.nodesById(edge.`object`).pageRank.get)(Ordering[Double].reverse).take(limit))

            partitionStart = partitionEnd
          }
        }
      }
    }
  }

  private def testGetTotalEdgesCount(storeFactory: KgStoreFactory): Unit = {
    "get total edges count" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.edges.size
        val actual = query.getTotalEdgesCount
        actual should equal(expected)
      }
    }
  }

  private def testGetTotalNodesCount(storeFactory: KgStoreFactory): Unit = {
    "get total nodes count" in {
      storeFactory(StoreTestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes.size
        val actual = query.getTotalNodesCount
        actual should equal(expected)
      }
    }
  }

  private def testIsEmpty(storeFactory: KgStoreFactory): Unit = {
    "check if is empty" in {
      storeFactory(StoreTestMode.ReadWrite) { case (command, query) =>
        query.isEmpty should be(false)
        command.withTransaction {
          _.clear()
        }
        query.isEmpty should be(true)
      }
    }
  }

  def queryStore(storeFactory: KgStoreFactory) {
    behave like testGetEdges(storeFactory)
    behave like testGetNodeById(storeFactory)
    behave like testGetNodesByLabel(storeFactory)
    behave like testGetPathById(storeFactory)
    behave like testGetRandomNode(storeFactory)
    behave like testGetSources(storeFactory)
    behave like testGetTopEdges(storeFactory)
    behave like testGetTotalEdgesCount(storeFactory)
    behave like testGetTotalNodesCount(storeFactory)
    behave like testIsEmpty(storeFactory)
    behave like testSearch(storeFactory)
    behave like testSearchCount(storeFactory)
    behave like testSearchFacets(storeFactory)
  }
}
