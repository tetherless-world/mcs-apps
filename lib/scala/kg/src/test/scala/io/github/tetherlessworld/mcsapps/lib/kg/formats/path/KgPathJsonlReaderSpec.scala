package io.github.tetherlessworld.mcsapps.lib.kg.formats.path

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgtkDataResources
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class KgPathJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "KG path .jsonl reader" can {
    "read the test data" in {
      withResource(KgPathsJsonlIterator.open(TestKgtkDataResources.pathsJsonl.getAsStream())) { iterator =>
        val paths = iterator.toList
        paths.size should be > 0
        for (path <- paths) {
          path.id should not be empty
          path.sources.size should be > 0
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
