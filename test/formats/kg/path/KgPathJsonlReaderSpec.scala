package formats.kg.path

import org.scalatest.{Matchers, WordSpec}
import stores.{TestData, WithResource}

import scala.io.Source

class KgPathJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Path .jsonl reader" can {
    "read the test data" in {
      withResource(new PathJsonlReader(Source.fromInputStream(TestData.getPathsJsonlResourceAsStream(), "UTF-8"))) { reader =>
        val paths = reader.toStream.toList
        paths.size should be > 0
        for (path <- paths) {
          path.id should not be empty
          path.datasource should not be empty
          path.path should not be empty
          path.path.size % 2 should be (1)
          val pathEdges = path.edges
          pathEdges(0).subject should be(path.path(0))
          pathEdges(pathEdges.length - 1).`object` should be (path.path(path.path.length - 1))
        }
      }
    }
  }
}
