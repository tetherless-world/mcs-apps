package io.github.tetherlessworld.mcsapps.lib.kg.formats.benchmark

import io.github.tetherlessworld.mcsapps.lib.kg.data.benchmark.TestBenchmarkDataResources
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class BenchmarkSubmissionsJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmark submissions .jsonl reader" can {
    "read the test data" in {
      withResource(BenchmarkSubmissionsJsonlReader.open(TestBenchmarkDataResources.benchmarkSubmissionsJsonl.getAsStream())) { reader =>
        val submissions = reader.iterator.toList
        for (submission <- submissions) {
          submission.datasetId should not be empty
          submission.id should not be empty
        }
      }
    }
  }
}
