package formats.kg.kgtk

import data.kg.TestKgtkDataResource
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class KgtkTsvReaderSpec extends WordSpec with Matchers with WithResource {
  "Kgtk Tsv Reader" can {
    "read the test data" in {
      withResource(KgtkTsvReader.open(TestKgtkDataResource.getTsvResourceAsStream())) { reader =>
        val data = reader.iterator.toList
        data.size should be > 0
        for (values <- data) {
          val edge = values._1
          edge.id should not be empty
          edge.`object` should not be empty
          edge.subject should not be empty
          edge.predicate should not be empty
          edge.datasources.size should be > 0
          for (node <- List(values._2, values._3)) {
            node.id should not be empty
            node.label should not be empty
            node.datasources.size should be > 0
          }
        }
      }
    }
  }
}
