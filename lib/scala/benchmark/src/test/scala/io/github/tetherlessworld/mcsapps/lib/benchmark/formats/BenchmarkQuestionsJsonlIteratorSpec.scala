package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import io.github.tetherlessworld.mcsapps.lib.benchmark.data.TestBenchmarkDataResources
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

class BenchmarkQuestionsJsonlIteratorSpec extends WordSpec with Matchers with WithResource {
  "Benchmark questions .jsonl reader" can {
    "read the test data" in {
      withResource(BenchmarkQuestionsJsonlIterator.open(TestBenchmarkDataResources.benchmarkQuestionsJsonl.getAsStream())) { iterator =>
        val questions = iterator.toList
        for (question <- questions) {
          question.datasetId should not be empty
          question.id should not be empty
          question.choices should not be empty
          for (choice <- question.choices) {
            choice.id should not be empty
            choice.identifier should not be None
            choice.identifier.get should not be empty
            choice.position should be >= 0
            choice.position should be < question.choices.size
            choice.text should not be empty
          }
          if (question.concept.isDefined) {
            question.concept.get should not be empty
          }
          question.prompts should not be empty
          for (prompt <- question.prompts) {
            prompt.text should not be empty
          }
          question.`type` should not be None
        }
      }
    }
  }
}
