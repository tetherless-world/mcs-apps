package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgNode
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

import scala.math.abs

trait KgStoreBehaviors extends Matchers with WithResource {
  this: WordSpec =>

  sealed trait TestMode

  object TestMode {

    case object ReadOnly extends TestMode

    case object ReadWrite extends TestMode

  }

  trait KgStoreFactory {
    def apply(testMode: TestMode)(f: (KgCommandStore, KgQueryStore) => Unit)
  }

  private def equals(left: KgNode, right: KgNode) =
    left.id == right.id && abs(left.pageRank.getOrElse(-1.0) - right.pageRank.getOrElse(-1.0)) < 0.1 && left.sourceIds == right.sourceIds && left.labels == right.labels && left.pos == right.pos


  def store(storeFactory: KgStoreFactory) {
    "get edges by object" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        for (node <- TestKgData.nodes) {
          val edges = query.getEdgesByObjectNodeId(limit = 1, offset = 0, objectNodeId = node.id)
          edges.size should be(1)
          val edge = edges(0)
          edge.`object` should equal(node.id)
        }
      }
    }

    "page edges by object" in {
      val sut = storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val node = TestKgData.nodes(0)
        val expected = TestKgData.edges.filter(edge => edge.`object` == node.id).sortBy(edge => (edge.subject, edge.predicate))
        expected.size should be > 1
        val actual = (0 until expected.size).flatMap(offset => query.getEdgesByObjectNodeId(limit = 1, offset = offset, objectNodeId = node.id)).sortBy(edge => (edge.subject, edge.predicate)).toList
        actual should equal(expected)
      }
    }

    "get edges by subject" in {
      val sut = storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val node = TestKgData.nodes(0)
        val edges = query.getEdgesBySubjectNodeId(limit = 1, offset = 0, subjectNodeId = node.id)
        edges.size should be(1)
        val edge = edges(0)
        edge.subject should equal(node.id)
      }
    }

    "page edges by subject" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val node = TestKgData.nodes(0)
        val expected = TestKgData.edges.filter(edge => edge.subject == node.id).sortBy(edge => (edge.predicate, edge.`object`))
        expected.size should be > 1
        val actual = (0 until expected.size).flatMap(offset => query.getEdgesBySubjectNodeId(limit = 1, offset = offset, subjectNodeId = node.id)).sortBy(edge => (edge.predicate, edge.`object`)).toList
        actual should equal(expected)
      }
    }

    "get matching nodes by label" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(expected.labels(0))), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty
        equals(actual(0), expected) shouldEqual true
      }
    }

    "get top edges by object" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val limit = 3
        val objectNodeId = TestKgData.nodes(0).id
        val actual = query.getTopEdgesByObjectNodeId(limit, objectNodeId)

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

    "get top edges by subject" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val limit = 3
        val subjectNodeId = TestKgData.nodes(0).id
        val actual = query.getTopEdgesBySubjectNodeId(limit, subjectNodeId)

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

    "get count of matching nodes with a label" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.searchCount(query = KgSearchQuery(filters = None, text = Some(expected.labels(0))))
        actual should be >= 1
      }
    }

    "get matching nodes with a source" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty
        actual(0).sourceIds should equal(expected.sourceIds)
      }
    }

    "not return matching nodes for a non-extant source" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:nonextant")), sorts = None)
        actual.size should be(0)
      }
    }

    "get matching nodes count with no text search and no filters" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        query.searchCount(query = KgSearchQuery(filters = None, text = None)) should equal(TestKgData.nodes.size)
      }
    }

    "get matching nodes count with no text search but with filters" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        query.searchCount(query = KgSearchQuery(filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(exclude = None, include = Some(List(TestKgData.nodes(0).sourceIds(0))))))), text = None)) should equal(TestKgData.nodes.size)
        query.searchCount(query = KgSearchQuery(filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(exclude = Some(List(TestKgData.nodes(0).sourceIds(0))))))), text = None)) should equal(0)
      }
    }

    "get matching nodes with a given source and label" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"""sources:${expected.sourceIds(0)} labels:"${expected.labels(0)}"""")), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty
        equals(actual(0), expected) shouldEqual true
      }
    }

    "get matching nodes with a given id" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"""id:"${expected.id}"""")), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual.size should be(1)
        equals(actual(0), expected) shouldEqual true
      }
    }

    "get matching nodes with a given source sorted by pageRank descending" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgNodeSortableField.PageRank, SortDirection.Descending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty

        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double].reverse).take(10)
        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
      }
    }

    "get matching nodes with a given source sorted by pageRank ascending" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)

        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgNodeSortableField.PageRank, SortDirection.Ascending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty

        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double]).take(10)
        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
      }
    }

    "get matching nodes with a given source sorted by pageRank descending with offset" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.search(limit = 10, offset = 5, query = KgSearchQuery(filters = None, text = Some(s"sources:${expected.sourceIds}")), sorts = Some(List(KgSearchSort(KgNodeSortableField.PageRank, SortDirection.Descending)))).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeSearchResult].node)
        actual should not be empty

        val expectedNodes = TestKgData.nodes.filter(_.sourceIds.intersect(expected.sourceIds).size > 0).sortBy(_.pageRank.get)(Ordering[Double].reverse).slice(5, 15)
        actual.zip(expectedNodes).forall((nodes) => equals(nodes._1, nodes._2)) shouldEqual true
      }
    }

    "filter out matching nodes" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
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

    "get matching node facets for all nodes" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val allFacets = query.searchFacets(KgSearchQuery(filters = None, text = None))
        allFacets.sourceIds.sortBy(_.value) should equal(TestKgData.sources.sortBy(_.id).map(_.id))
      }
    }

    "get matching node facets for filtered nodes" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val facets = query.searchFacets(query = KgSearchQuery(filters = Some(KgSearchFilters(sourceIds = Some(StringFacetFilter(include = Some(expected.sourceIds), exclude = None)))), text = None))
        facets.sourceIds.size should be < TestKgData.sources.size
        facets.sourceIds.sortBy(_.value).map(_.value) should equal(expected.sourceIds.sortBy(sourceId => sourceId))
      }
    }

    "get matching node labels" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val actual = query.search(limit = 10, offset = 0, query = KgSearchQuery(filters = None, text = None), sorts = None).filter(_.isInstanceOf[KgNodeSearchResult]).map(_.asInstanceOf[KgNodeLabelSearchResult].nodeLabel)
        actual.size should equal(10)
        actual.toSet.size should equal(actual.size)
        for (label <- actual) {
          label should not be empty
        }
      }
    }

    "get node by id" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.getNodeById(expected.id).get
        equals(actual, expected) shouldEqual true
      }
    }

    "get nodes by label" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes(0)
        val actual = query.getNodesByLabel(expected.labels(0))
        actual.exists(_.id == expected.id) shouldEqual true
      }
    }

    "get a random node" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = query.getRandomNode
        val actual = query.getNodeById(expected.id).get
        equals(actual, expected) shouldEqual true
      }
    }

    "get total edges count" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.edges.size
        val actual = query.getTotalEdgesCount
        actual should equal(expected)
      }
    }

    "get total nodes count" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.nodes.size
        val actual = query.getTotalNodesCount
        actual should equal(expected)
      }
    }

    "get a path by id" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        val expected = TestKgData.paths(0)
        query.getPathById(expected.id) should equal(Some(expected))
      }
    }

    "return None for a non-extant path" in {
      storeFactory(TestMode.ReadOnly) { case (command, query) =>
        query.getPathById("nonextant") should equal(None)
      }
    }

    "check if is empty" in {
      storeFactory(TestMode.ReadWrite) { case (command, query) =>
        query.isEmpty should be(false)
        command.withTransaction {
          _.clear()
        }
        query.isEmpty should be(true)
      }
    }

    "get sources" in {
      storeFactory(TestMode.ReadWrite) { case (command, query) =>
        val expected = TestKgData.sources.sortBy(_.id)
        val actual = query.getSources.sortBy(_.id)
        actual should equal(expected)
      }
    }

    "put and get sources" in {
      storeFactory(TestMode.ReadWrite) { case (command, query) =>
        command.withTransaction {
          _.clear()
        }
        query.isEmpty should be(true)
        command.withTransaction {
          _.putSources(TestKgData.sources)
        }
        query.getSources.sortBy(_.id) should equal(TestKgData.sources.sortBy(_.id))
      }
    }
  }
}
