package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkQuestionSet, BenchmarkSubmission}

class MemBenchmarkStore extends BenchmarkStore {
  private val benchmarks: List[Benchmark] = BenchmarkTestData.benchmarks
  private val benchmarkAnswers: List[BenchmarkAnswer] = BenchmarkTestData.benchmarkAnswers
  private val benchmarkQuestions: List[BenchmarkQuestion] = BenchmarkTestData.benchmarkQuestions
  private val benchmarkSubmissions: List[BenchmarkSubmission] = BenchmarkTestData.benchmarkSubmissions

  final override def getBenchmarks: List[Benchmark] = benchmarks

  final override def getBenchmarkAnswersBySubmission(benchmarkSubmissionId: String, limit: Int, offset: Int): List[BenchmarkAnswer] =
    benchmarkAnswers
      .filter(answer => answer.submissionId == benchmarkSubmissionId)
      .drop(offset).take(limit)

  final override def getBenchmarkById(benchmarkId: String): Option[Benchmark] =
    benchmarks.find(benchmark => benchmark.id == benchmarkId)

  final override def getBenchmarkQuestionsBySet(benchmarkId: String, benchmarkQuestionSetId: String, limit: Int, offset: Int): List[BenchmarkQuestion] =
    benchmarkQuestions
      .filter(question => question.benchmarkId == benchmarkId && question.questionSetId == benchmarkQuestionSetId)
      .drop(offset).take(limit)

  final override def getBenchmarkSubmissionsByBenchmark(benchmarkId: String): List[BenchmarkSubmission] =
    benchmarkSubmissions.filter(submission => submission.benchmarkId == benchmarkId)

  override def getBenchmarkQuestionById(benchmarkId: String, benchmarkQuestionSetId: String, benchmarkQuestionId: String): Option[BenchmarkQuestion] =
    benchmarkQuestions
      .find(question => question.benchmarkId == benchmarkId && question.questionSetId == benchmarkQuestionSetId && question.id == benchmarkQuestionId)
}
