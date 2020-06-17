package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkQuestionSet, BenchmarkSubmission}

trait BenchmarkStore {
  def getBenchmarks: List[Benchmark]
  def getBenchmarkAnswerByQuestion(benchmarkQuestionId: String, benchmarkSubmissionId: String): Option[BenchmarkAnswer]
  def getBenchmarkAnswersBySubmission(benchmarkSubmissionId: String, limit: Int, offset: Int): List[BenchmarkAnswer]
  def getBenchmarkById(benchmarkId: String): Option[Benchmark]
  def getBenchmarkQuestionById(benchmarkQuestionId: String): Option[BenchmarkQuestion]
  def getBenchmarkQuestionsBySet(benchmarkQuestionSetId: String, limit: Int, offset: Int): List[BenchmarkQuestion]
  def getBenchmarkSubmissionsByBenchmark(benchmarkId: String): List[BenchmarkSubmission]
  def getBenchmarkSubmissionsByQuestionSet(questionSetId: String): List[BenchmarkSubmission]
}
