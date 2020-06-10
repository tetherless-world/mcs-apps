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
        }
      } finally {
        inputStream.close()
      }
    }
  }
}
