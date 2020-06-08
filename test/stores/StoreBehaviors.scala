package stores

import org.scalatest.{Matchers, WordSpec}

trait StoreBehaviors extends Matchers { this: WordSpec =>
  def store(sut: Store) {
    "get edges by object" in {
      for (node <- TestData.nodes) {
        val edges = sut.getEdgesByObject(limit = 1, offset = 0, objectNodeId = node.id)
        edges.size should be(1)
        val edge = edges(0)
        edge.`object` should equal(node.id)
      }
    }

    "page edges by object" in {
      val node = TestData.nodes(0)
      val expected = TestData.edges.filter(edge => edge.`object` == node.id).sortBy(edge => (edge.subject, edge.predicate))
      expected.size should be > 10
      val actual = (0 until expected.size).flatMap(offset => sut.getEdgesByObject(limit = 1, offset = offset, objectNodeId = node.id)).sortBy(edge => (edge.subject, edge.predicate)).toList
      actual should equal(expected)
    }

    "get edges by subject" in {
      val node = TestData.nodes(0)
      val edges = sut.getEdgesBySubject(limit = 1, offset = 0, subjectNodeId = node.id)
      edges.size should be(1)
      val edge = edges(0)
      edge.subject should equal(node.id)
    }

    "page edges by subject" in {
      val node = TestData.nodes(0)
      val expected = TestData.edges.filter(edge => edge.subject == node.id).sortBy(edge => (edge.predicate, edge.`object`))
      expected.size should be > 10
      val actual = (0 until expected.size).flatMap(offset => sut.getEdgesBySubject(limit = 1, offset = offset, subjectNodeId = node.id)).sortBy(edge => (edge.predicate, edge.`object`)).toList
      actual should equal(expected)
    }


    "get matching nodes by label" in {
      val expected = TestData.nodes(0)
      val actual = sut.getMatchingNodes(limit = 10, offset = 0, text = expected.label)
      actual should not be empty
      actual(0) should equal(expected)
    }

    "get count of matching nodes by label" in {
      val expected = TestData.nodes(0)
      val actual = sut.getMatchingNodesCount(text = expected.label)
      actual should be >= 1
    }

    "get matching nodes by datasource" in {
      val expected = TestData.nodes(0)
      val actual = sut.getMatchingNodes(limit = 10, offset = 0, text = s"datasource:${expected.datasource}")
      actual should not be empty
      actual(0).datasource should equal(expected.datasource)
    }

    "not return matching nodes for a non-extant datasource" in {
      val actual = sut.getMatchingNodes(limit = 10, offset = 0, text = s"datasource:nonextant")
      actual.size should be(0)
    }

    "get matching nodes by datasource and label" in {
      val expected = TestData.nodes(0)
      val actual = sut.getMatchingNodes(limit = 10, offset = 0, text = s"""datasource:${expected.datasource} label:"${expected.label}"""")
      actual should not be empty
      actual(0) should equal(expected)
    }

    "get matching nodes by id" in {
      val expected = TestData.nodes(0)
      val actual = sut.getMatchingNodes(limit = 10, offset = 0, text = s"""id:"${expected.id}"""")
      actual.size should be(1)
      actual(0) should equal(expected)
    }

    "get node by id" in {
      val expected = TestData.nodes(0)
      val actual = sut.getNodeById(expected.id)
      actual should equal(Some(expected))
    }

    "get a random node" in {
      val node = sut.getRandomNode
      sut.getNodeById(node.id) should equal(Some(node))
    }

    "get total edges count" in {
      val expected = TestData.edges.size
      val actual = sut.getTotalEdgesCount
      actual should equal(expected)
    }

    "get total nodes count" in {
      val expected = TestData.nodes.size
      val actual = sut.getTotalNodesCount
      actual should equal(expected)
    }

    "get datasources" in {
      val expected = TestData.nodes.flatMap(_.datasource.split(",")).toSet
      val actual = sut.getDatasources.toSet
      // Convert list to set to compare content
      actual should equal(expected)
    }
  }
}
