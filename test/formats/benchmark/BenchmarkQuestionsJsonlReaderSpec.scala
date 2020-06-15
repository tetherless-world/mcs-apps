package formats.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.WithResource
import stores.benchmark.BenchmarkTestData

import scala.io.Source

class BenchmarkQuestionsJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmark questions .jsonl reader" can {
    "read the test data" in {
      withResource(new BenchmarkQuestionsJsonlReader(Source.fromInputStream(BenchmarkTestData.getBenchmarkQuestionsJsonResourceAsStream(), "UTF-8"))) { reader =>
        val questions = reader.toStream.toList
        for (question <- questions) {
          question.benchmarkId should not be empty
          question.questionSetId should not be empty
          question.id should not be empty
          question.choices should not be empty
          for (choice <- question.choices) {
            choice.label should not be empty
            choice.text should not be empty
          }
          if (question.concept.isDefined) {
            question.concept.get should not be empty
          }
          question.text should not be empty
        }
      }
    }
  }
}
