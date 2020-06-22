package stores.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.StringFilter

trait BenchmarkStoreBehaviors extends Matchers { this: WordSpec =>
  def store(sut: BenchmarkStore) {
    "get benchmark trees" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        benchmark.datasets should not be empty
        for (dataset <- benchmark.datasets) {
          val questions = sut.getBenchmarkQuestionsByDataset(benchmarkDatasetId = dataset.id, limit = 1000, offset = 0)
          questions should not be empty
          questions.size should be < 1000
          val questionCount = sut.getBenchmarkQuestionCountByDataset(dataset.id)
          questionCount should equal(questions.size)
        }
      }
    }

    "get benchmark submission trees" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        val submissions = sut.getBenchmarkSubmissionsByBenchmark(benchmark.id)
        submissions should not be empty
        sut.getBenchmarkSubmissionsCountByBenchmark(benchmark.id) should equal(submissions.size)
        for (submission <- submissions) {
          submission.benchmarkId should equal(benchmark.id)
          val dataset = benchmark.datasets.find(dataset => submission.datasetId == dataset.id)
          dataset should not be None
          val answers = sut.getBenchmarkAnswersBySubmission(submission.id, limit = 1000, offset = 0)
          answers should not be empty
          for (answer <- answers) {
            val question = sut.getBenchmarkQuestionById(answer.questionId)
            question should not be None
            question.get.choices.exists(choice => choice.label == answer.choiceLabel) should be(true)
            answer.explanation should not be None
            answer.explanation.get.choiceAnalyses should not be None
            for (choiceAnalysis <- answer.explanation.get.choiceAnalyses.get) {
              question.get.choices.exists(choice => choice.label == choiceAnalysis.choiceLabel) should be (true)
            }
          }
        }
      }
    }
  }
}
