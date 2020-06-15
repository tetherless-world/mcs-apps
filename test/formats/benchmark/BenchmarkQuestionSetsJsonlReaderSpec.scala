package formats.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.WithResource
import stores.benchmark.BenchmarkTestData

import scala.io.Source

class BenchmarkQuestionSetsJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmark question sets .jsonl reader" can {
    "read the test data" in {
      withResource(new BenchmarkQuestionSetsJsonlReader(Source.fromInputStream(BenchmarkTestData.getBenchmarkQuestionSetsJsonlResourceAsStream(), "UTF-8"))) { reader =>
        val questionSets = reader.toStream.toList
        questionSets should not be empty
        for (questionSet <- questionSets) {
          questionSet.benchmarkId should not be empty
          questionSet.id should not be empty
        }
      }
    }
  }
}
