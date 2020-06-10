package formats.path

import org.scalatest.{Matchers, WordSpec}

import scala.io.Source

class PathJsonlReaderSpec extends WordSpec with Matchers {
  "Path .jsonl reader" can {
    val sut = new PathJsonlReader()

    "read the test data" in {
      val inputStream = getClass.getResourceAsStream("/test_data/paths.jsonl")
      try {
        val paths = sut.read(Source.fromInputStream(inputStream, "UTF-8")).toList
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
      } finally {
        inputStream.close()
      }
    }
  }
}
