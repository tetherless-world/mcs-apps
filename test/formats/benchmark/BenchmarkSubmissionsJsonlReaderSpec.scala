package formats.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.WithResource
import stores.benchmark.{TestBenchmarkData, TestBenchmarkDataResources}

import scala.io.Source

class BenchmarkSubmissionsJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmark submissions .jsonl reader" can {
    "read the test data" in {
      withResource(new BenchmarkSubmissionsJsonlReader(Source.fromInputStream(TestBenchmarkDataResources.getBenchmarkSubmissionsJsonlResourceAsStream(), "UTF-8"))) { reader =>
        val submissions = reader.iterator.toList
        for (submission <- submissions) {
          submission.datasetId should not be empty
          submission.id should not be empty
        }
      }
    }
  }
}
