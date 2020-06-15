package stores.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.StringFilter

trait BenchmarkStoreBehaviors extends Matchers { this: WordSpec =>
  def store(sut: BenchmarkStore) {
    "get benchmarks" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
    }

    "get benchmark question sets for every benchmark" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        val questionSets = sut.getBenchmarkQuestionSets(benchmark.id)
        questionSets should not be empty
      }
    }

    "get benchmark questions for every question set" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        val questionSets = sut.getBenchmarkQuestionSets(benchmark.id)
        questionSets should not be empty
        for (questionSet <- questionSets) {
          val questions = sut.getBenchmarkQuestionsBySet(benchmarkId = benchmark.id, benchmarkQuestionSetId = questionSet.id, limit = 1000, offset = 0)
          questions should not be empty
          questions.size should be < 1000
        }
      }
    }
  }
}
