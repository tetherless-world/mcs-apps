package formats.cskg

import org.scalatest.{Matchers, WordSpec}
import stores.{TestData, WithResource}

class CskgEdgesCsvReaderSpec extends WordSpec with Matchers with WithResource {
  "CSKG edges CSV reader" can {
    "read the test data" in {
      withResource (CskgEdgesCsvReader.open(TestData.getEdgesCsvResourceAsStream())) { reader =>
        val edges = reader.toStream.toList
        edges.size should be > 0
        for (edge <- edges) {
          edge.subject should not be empty
          edge.`object` should not be empty
          edge.datasource should not be empty
        }
      }
    }
  }
}
