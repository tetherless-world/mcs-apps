package formats.kg.cskg

import data.kg.TestKgDataResources
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class CskgEdgesCsvReaderSpec extends WordSpec with Matchers with WithResource {
  "CSKG edges CSV reader" can {
    "read the test data" in {
      withResource (CskgEdgesCsvReader.open(TestKgDataResources.getEdgesCsvResourceAsStream())) { reader =>
        val edges = reader.iterator.toList
        edges.size should be > 0
        for (edge <- edges) {
          edge.id should not be empty
          edge.`object` should not be empty
          edge.sources.size should be > 0
          edge.subject should not be empty
          edge.relation should not be empty
        }
      }
    }
  }
}
