package formats.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.WithResource
import stores.benchmark.BenchmarkTestData

import scala.io.Source

class BenchmarkAnswersJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmark answers .jsonl reader" can {
    "read the test data" in {
      withResource(new BenchmarkAnswersJsonlReader(Source.fromInputStream(BenchmarkTestData.getBenchmarkAnswersJsonlResourceAsStream(), "UTF-8"))) { reader =>
        val answers = reader.toStream.toList
        for (answer <- answers) {
          answer.submissionId should not be empty
          answer.choiceLabel should not be empty
          answer.questionId should not be empty
          answer.explanation should not be None
        }
      }
    }
  }
}
