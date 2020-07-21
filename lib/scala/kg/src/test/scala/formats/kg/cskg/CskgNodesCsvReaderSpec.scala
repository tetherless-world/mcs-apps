package formats.kg.cskg

import data.kg.TestCskgCsvDataResources
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class CskgNodesCsvReaderSpec extends WordSpec with Matchers with WithResource {
  "CSKG nodes CSV reader" can {
    "read the test data" in {
      withResource (CskgNodesCsvReader.open(TestCskgCsvDataResources.nodesCsvBz2.getAsStream())) { reader =>
        val nodes = reader.iterator.toList
        nodes.size should be > 0
        for (node <- nodes) {
          node.id should not be empty
          node.labels.size should be > 0
          node.sources.size should be > 0
        }
      }
    }
  }
}
