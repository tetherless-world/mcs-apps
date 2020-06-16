package stores.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.StringFilter

trait BenchmarkStoreBehaviors extends Matchers { this: WordSpec =>
  def store(sut: BenchmarkStore) {
    "get benchmark trees" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        benchmark.questionSets should not be empty
        for (questionSet <- benchmark.questionSets) {
          val questions = sut.getBenchmarkQuestionsBySet(benchmarkId = benchmark.id, benchmarkQuestionSetId = questionSet.id, limit = 1000, offset = 0)
          questions should not be empty
          questions.size should be < 1000
        }
      }
    }

    "get benchmark submission trees" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        val submissions = sut.getBenchmarkSubmissionsByBenchmark(benchmark.id)
        submissions should not be empty
        for (submission <- submissions) {
          submission.benchmarkId should equal(benchmark.id)
          val questionSet = benchmark.questionSets.find(questionSet => submission.questionSetId == questionSet.id)
          questionSet should not be None
          val answers = sut.getBenchmarkAnswersBySubmission(submission.id, limit = 1000, offset = 0)
          answers should not be empty
          for (answer <- answers) {
            val question = sut.getBenchmarkQuestionById(benchmarkId = benchmark.id, benchmarkQuestionSetId = questionSet.get.id, benchmarkQuestionId = answer.questionId)
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
