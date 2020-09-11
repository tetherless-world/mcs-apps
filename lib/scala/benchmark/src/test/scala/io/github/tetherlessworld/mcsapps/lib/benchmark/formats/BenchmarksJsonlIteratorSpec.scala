package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import io.github.tetherlessworld.mcsapps.lib.benchmark.data.TestBenchmarkDataResources
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class BenchmarksJsonlIteratorSpec extends WordSpec with Matchers with WithResource {
  "Benchmarks .jsonl reader" can {
    "read the test data" in {
      withResource(BenchmarksJsonlIterator.open(TestBenchmarkDataResources.benchmarksJsonl.getAsStream())) { iterator =>
        val benchmarks = iterator.toList
        benchmarks should not be empty
        for (benchmark <- benchmarks) {
          benchmark.id should not be empty
          benchmark.name should not be empty
        }
      }
    }
  }
}
