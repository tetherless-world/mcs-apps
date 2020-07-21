package stores.kg

import data.kg.TestKgData
import models.kg.KgEdge
import org.scalactic.TolerantNumerics
import org.scalatest.{Matchers, WordSpec}
import stores.StringFilter

trait KgStoreBehaviors extends Matchers { this: WordSpec =>
  def store(sut: KgStore) {
    "get edges by object" in {
      for (node <- TestKgData.nodes) {
        val edges = sut.getEdgesByObject(limit = 1, offset = 0, objectNodeId = node.id)
        edges.size should be(1)
        val edge = edges(0)
        edge.`object` should equal(node.id)
      }
    }

    "page edges by object" in {
      val node = TestKgData.nodes(0)
      val expected = TestKgData.edges.filter(edge => edge.`object` == node.id).sortBy(edge => (edge.subject, edge.predicate))
      expected.size should be > 10
      val actual = (0 until expected.size).flatMap(offset => sut.getEdgesByObject(limit = 1, offset = offset, objectNodeId = node.id)).sortBy(edge => (edge.subject, edge.predicate)).toList
      actual should equal(expected)
    }

    "get edges by subject" in {
      val node = TestKgData.nodes(0)
      val edges = sut.getEdgesBySubject(limit = 1, offset = 0, subjectNodeId = node.id)
      edges.size should be(1)
      val edge = edges(0)
      edge.subject should equal(node.id)
    }

    "page edges by subject" in {
      val node = TestKgData.nodes(0)
      val expected = TestKgData.edges.filter(edge => edge.subject == node.id).sortBy(edge => (edge.predicate, edge.`object`))
      expected.size should be >= 4
      val actual = (0 until expected.size).flatMap(offset => sut.getEdgesBySubject(limit = 1, offset = offset, subjectNodeId = node.id)).sortBy(edge => (edge.predicate, edge.`object`)).toList
      actual should equal(expected)
    }

    "get matching nodes by label" in {
      val expected = TestKgData.nodes(0)
      val actual = sut.getMatchingNodes(filters = None, limit = 10, offset = 0, text = Some(expected.labels(0)))
      actual should not be empty
      actual(0) should equal(expected)
    }

    "get count of matching nodes by label" in {
      val expected = TestKgData.nodes(0)
      val actual = sut.getMatchingNodesCount(filters = None, text = Some(expected.labels(0)))
      actual should be >= 1
    }

    "get matching nodes by source" in {
      val expected = TestKgData.nodes(0)
      val actual = sut.getMatchingNodes(filters = None, limit = 10, offset = 0, text = Some(s"sources:${expected.sources}"))
      actual should not be empty
      actual(0).sources should equal(expected.sources)
    }

    "not return matching nodes for a non-extant source" in {
      val actual = sut.getMatchingNodes(filters = None, limit = 10, offset = 0, text = Some(s"sources:nonextant"))
      actual.size should be(0)
    }

    "get matching nodes count with no text search and no filters" in {
      sut.getMatchingNodesCount(filters = None, text = None) should equal(TestKgData.nodes.size)
    }

    "get matching nodes count with no text search but with filters" in {
      sut.getMatchingNodesCount(filters = Some(KgNodeFilters(sources = Some(StringFilter(exclude = None, include = Some(List(TestKgData.nodes(0).sources(0))))))), text = None) should equal(TestKgData.nodes.size)
      sut.getMatchingNodesCount(filters = Some(KgNodeFilters(sources = Some(StringFilter(exclude = Some(List(TestKgData.nodes(0).sources(0))))))), text = None) should equal(0)
    }

    "get matching nodes by source and label" in {
      val expected = TestKgData.nodes(0)
      val actual = sut.getMatchingNodes(filters = None, limit = 10, offset = 0, text = Some(s"""sources:${expected.sources(0)} labels:"${expected.labels(0)}""""))
      actual should not be empty
      actual(0) should equal(expected)
    }

    "get matching nodes by id" in {
      val expected = TestKgData.nodes(0)
      val actual = sut.getMatchingNodes(filters = None, limit = 10, offset = 0, text = Some(s"""id:"${expected.id}""""))
      actual.size should be(1)
      actual(0) should equal(expected)
    }

    "get node by id" in {
      val expected = TestKgData.nodes(0)
      val actual = sut.getNodeById(expected.id)
      actual should equal(Some(expected))
    }

    "get a random node" in {
      val node = sut.getRandomNode
      sut.getNodeById(node.id) should equal(Some(node))
    }

    "get total edges count" in {
      val expected = TestKgData.edges.size
      val actual = sut.getTotalEdgesCount
      actual should equal(expected)
    }

    "get total nodes count" in {
      val expected = TestKgData.nodes.size
      val actual = sut.getTotalNodesCount
      actual should equal(expected)
    }

    "get sources" in {
      val expected = TestKgData.nodes.flatMap(_.sources).toSet
      val actual = sut.getSources.toSet
      // Convert list to set to compare content
      actual should equal(expected)
    }

    "filter out matching nodes" in {
      val text = "Test"
      val countBeforeFilters = sut.getMatchingNodesCount(filters = None, text = Some(text))
      countBeforeFilters should be > 0
      val actualCount = sut.getMatchingNodesCount(
        filters = Some(KgNodeFilters(sources = Some(StringFilter(exclude = Some(List(TestKgData.nodes(0).sources(0))), include = None)))),
        text = Some("Test")
      )
      actualCount should equal(0)
    }

    "get a path by id" in {
      val expected = TestKgData.paths(0)
      sut.getPathById(expected.id) should equal(Some(expected))
    }

    "return None for a non-extant path" in {
      sut.getPathById("nonextant") should equal(None)
    }

    "check if is empty" in {
      sut.isEmpty should be(false)
      sut.clear()
      sut.isEmpty should be(true)
    }
  }
}
