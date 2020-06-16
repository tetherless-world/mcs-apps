package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkQuestionSet, BenchmarkSubmission}

trait BenchmarkStore {
  def getBenchmarks: List[Benchmark]
  def getBenchmarkAnswersBySubmission(benchmarkSubmissionId: String, limit: Int, offset: Int): List[BenchmarkAnswer]
  def getBenchmarkById(benchmarkId: String): Option[Benchmark]
  def getBenchmarkQuestionById(benchmarkId: String, benchmarkQuestionSetId: String, benchmarkQuestionId: String): Option[BenchmarkQuestion]
  def getBenchmarkQuestionsBySet(benchmarkId: String, benchmarkQuestionSetId: String, limit: Int, offset: Int): List[BenchmarkQuestion]
  def getBenchmarkSubmissionsByBenchmark(benchmarkId: String): List[BenchmarkSubmission]
}
