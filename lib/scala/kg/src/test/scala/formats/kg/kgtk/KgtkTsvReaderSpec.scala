package formats.kg.kgtk

import data.kg.TestKgtkDataResource
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class KgtkTsvReaderSpec extends WordSpec with Matchers with WithResource {
  "Kgtk Tsv Reader" can {
    "read the test data" in {
      withResource(KgtkEdgesTsvReader.open(TestKgtkDataResource.getTsvResourceAsStream())) { reader =>
        val data = reader.iterator.toList
        data.size should be > 0
        for (edgeWithNodes <- data) {
          val edge = edgeWithNodes.edge
          edge.id should not be empty
          edge.`object` should not be empty
          edge.subject should not be empty
          edge.predicate should not be empty
          edge.sources.size should be > 0
          for (node <- List(edgeWithNodes.node1, edgeWithNodes.node2)) {
            node.id should not be empty
            node.labels.size should be > 0
            node.sources.size should be > 0
          }
        }
      }
    }
  }
}
