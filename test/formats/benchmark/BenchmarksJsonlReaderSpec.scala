package formats.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.WithResource
import stores.benchmark.{TestBenchmarkData, TestBenchmarkDataResources}
import stores.kg.TestKgData

import scala.io.Source

class BenchmarksJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmarks .jsonl reader" can {
    "read the test data" in {
      withResource(new BenchmarksJsonlReader(Source.fromInputStream(TestBenchmarkDataResources.getBenchmarksJsonlResourceAsStream(), "UTF-8"))) { reader =>
        val benchmarks = reader.iterator.toList
        benchmarks should not be empty
        for (benchmark <- benchmarks) {
          benchmark.id should not be empty
          benchmark.name should not be empty
        }
      }
    }
  }
}
