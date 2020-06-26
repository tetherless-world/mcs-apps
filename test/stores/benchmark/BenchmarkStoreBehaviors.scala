package stores.benchmark

import org.scalatest.{Matchers, WordSpec}
import stores.StringFilter

trait BenchmarkStoreBehaviors extends Matchers { this: WordSpec =>
  def store(sut: BenchmarkStore) {
    "get benchmarks" in {
      sut.getBenchmarks should equal(TestBenchmarkData.benchmarks)
    }

    "get benchmark answer by question" in {
      sut.getBenchmarkAnswerByQuestion(benchmarkQuestionId = TestBenchmarkData.benchmarkQuestion.id, benchmarkSubmissionId = TestBenchmarkData.benchmarkSubmission.id) should equal(Some(TestBenchmarkData.benchmarkAnswer))
    }

    "get benchmark answers by question" in {
      sut.getBenchmarkAnswersByQuestion(benchmarkQuestionId = TestBenchmarkData.benchmarkQuestion.id) should equal(List(TestBenchmarkData.benchmarkAnswer))
    }

    "get benchmark answers by submission" in {
      sut.getBenchmarkAnswersBySubmission(benchmarkSubmissionId = TestBenchmarkData.benchmarkSubmission.id, limit = 1000, offset = 0) should equal(TestBenchmarkData.benchmarkAnswers.filter(answer => answer.submissionId == TestBenchmarkData.benchmarkSubmission.id))
    }

    "get benchmark by id" in {
      sut.getBenchmarkById(TestBenchmarkData.benchmark.id) should equal(Some(TestBenchmarkData.benchmark))
    }

    "get benchmark question by id" in {
      sut.getBenchmarkQuestionById(benchmarkQuestionId = TestBenchmarkData.benchmarkQuestion.id) should equal(Some(TestBenchmarkData.benchmarkQuestion))
    }

    "get benchmark questions count by dataset" in {
      sut.getBenchmarkQuestionsCountByDataset(benchmarkDatasetId = TestBenchmarkData.benchmarkDataset.id) should equal(TestBenchmarkData.benchmarkQuestions.count(question => question.datasetId == TestBenchmarkData.benchmarkDataset.id))
    }

    "get benchmark questions by dataset" in {
      sut.getBenchmarkQuestionsByDataset(benchmarkDatasetId = TestBenchmarkData.benchmarkDataset.id, limit = 1000, offset = 0) should equal(TestBenchmarkData.benchmarkQuestions.filter(question => question.datasetId == TestBenchmarkData.benchmarkDataset.id))
    }

    "get benchmark submissions by benchmark" in {
      sut.getBenchmarkSubmissionsByBenchmark(benchmarkId = TestBenchmarkData.benchmark.id) should equal(TestBenchmarkData.benchmarkSubmissions.filter(submission => submission.benchmarkId == TestBenchmarkData.benchmark.id))
    }

    "get benchmark submission by id" in {
      sut.getBenchmarkSubmissionById(benchmarkSubmissionId = TestBenchmarkData.benchmarkSubmission.id) should equal(Some(TestBenchmarkData.benchmarkSubmission))
    }

    "get benchmark submissions by dataset" in {
      sut.getBenchmarkSubmissionsByDataset(benchmarkDatasetId = TestBenchmarkData.benchmarkDataset.id) should equal(TestBenchmarkData.benchmarkSubmissions.filter(submission => submission.datasetId == TestBenchmarkData.benchmarkDataset.id))
    }

    "get benchmark submissions count by benchmark" in {
      sut.getBenchmarkSubmissionsCountByBenchmark(benchmarkId = TestBenchmarkData.benchmark.id) should equal(TestBenchmarkData.benchmarkSubmissions.count(submission => submission.benchmarkId == TestBenchmarkData.benchmark.id))
    }

    "get benchmark submissions count by dataset" in {
      sut.getBenchmarkSubmissionsCountByDataset(benchmarkDatasetId = TestBenchmarkData.benchmarkDataset.id) should equal(TestBenchmarkData.benchmarkSubmissions.count(submission => submission.datasetId == TestBenchmarkData.benchmarkDataset.id))
    }

    "get benchmark trees" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        benchmark.datasets should not be empty
        for (dataset <- benchmark.datasets) {
          val questions = sut.getBenchmarkQuestionsByDataset(benchmarkDatasetId = dataset.id, limit = 1000, offset = 0)
          questions should not be empty
          questions.size should be < 1000
          val questionsCount = sut.getBenchmarkQuestionsCountByDataset(dataset.id)
          questionsCount should equal(questions.size)
        }
      }
    }

    "get benchmark submission trees" in {
      val benchmarks = sut.getBenchmarks
      benchmarks should not be empty
      for (benchmark <- benchmarks) {
        val benchmarkSubmissions = sut.getBenchmarkSubmissionsByBenchmark(benchmark.id)
        benchmarkSubmissions should not be empty
        sut.getBenchmarkSubmissionsCountByBenchmark(benchmark.id) should equal(benchmarkSubmissions.size)

        for (dataset <- benchmark.datasets) {
          val datasetSubmissions = sut.getBenchmarkSubmissionsByDataset(dataset.id)
          datasetSubmissions should not be empty
          sut.getBenchmarkSubmissionsCountByDataset(dataset.id) should equal(datasetSubmissions.size)

          val questions = sut.getBenchmarkQuestionsByDataset(benchmarkDatasetId = dataset.id, limit = 1000, offset = 0)
          questions should not be empty
          for (question <- questions) {
            val answers = sut.getBenchmarkAnswersByQuestion(question.id)
            answers should not be empty
            for (answer <- answers) {
              datasetSubmissions.exists(submission => submission.id == answer.submissionId) should be (true)
            }
          }
        }

        for (submission <- benchmarkSubmissions) {
          submission.benchmarkId should equal(benchmark.id)
          val dataset = benchmark.datasets.find(dataset => submission.datasetId == dataset.id)
          dataset should not be None
          val answers = sut.getBenchmarkAnswersBySubmission(submission.id, limit = 1000, offset = 0)
          answers should not be empty
          for (answer <- answers) {
            val question = sut.getBenchmarkQuestionById(answer.questionId)
            question should not be None
            question.get.choices.exists(choice => choice.id == answer.choiceId) should be(true)
            answer.explanation should not be None
            answer.explanation.get.choiceAnalyses should not be None
            for (choiceAnalysis <- answer.explanation.get.choiceAnalyses.get) {
              question.get.choices.exists(choice => choice.id == choiceAnalysis.choiceId) should be (true)
            }
          }
        }
      }
    }
  }
}
