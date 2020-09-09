package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import io.github.tetherlessworld.mcsapps.lib.benchmark.data.TestBenchmarkDataResources
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class BenchmarkSubmissionsJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmark submissions .jsonl reader" can {
    "read the test data" in {
      withResource(BenchmarkSubmissionsJsonlReader.open(TestBenchmarkDataResources.benchmarkSubmissionsJsonl.getAsStream())) { iterator =>
        val submissions = iterator.toList
        for (submission <- submissions) {
          submission.datasetId should not be empty
          submission.id should not be empty
        }
      }
    }
  }
}
