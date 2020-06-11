package formats.cskg

import org.scalatest.{Matchers, WordSpec}
import stores.{TestData, WithResource}

class CskgNodesCsvReaderSpec extends WordSpec with Matchers with WithResource {
  "CSKG nodes CSV reader" can {
    "read the test data" in {
      withResource (CskgNodesCsvReader.open(TestData.getNodesCsvResourceAsStream())) { reader =>
        val nodes = reader.toStream.toList
        nodes.size should be > 0
        for (node <- nodes) {
          node.id should not be empty
          node.label should not be empty
          node.datasource should not be empty
        }
      }
    }
  }
}
