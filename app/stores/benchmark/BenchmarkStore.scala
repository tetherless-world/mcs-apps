package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkDataset, BenchmarkSubmission}

trait BenchmarkStore {
  def getBenchmarks: List[Benchmark]

  def getBenchmarkAnswerByQuestion(benchmarkQuestionId: String, benchmarkSubmissionId: String): Option[BenchmarkAnswer]
  def getBenchmarkAnswersBySubmission(benchmarkSubmissionId: String, limit: Int, offset: Int): List[BenchmarkAnswer]

  def getBenchmarkById(benchmarkId: String): Option[Benchmark]

  def getBenchmarkQuestionById(benchmarkQuestionId: String): Option[BenchmarkQuestion]
  def getBenchmarkQuestionCountByDataset(benchmarkDatasetId: String): Int
  def getBenchmarkQuestionsByDataset(benchmarkDatasetId: String, limit: Int, offset: Int): List[BenchmarkQuestion]

  def getBenchmarkSubmissionsByBenchmark(benchmarkId: String): List[BenchmarkSubmission]
  def getBenchmarkSubmissionById(submissionId: String): Option[BenchmarkSubmission]
  def getBenchmarkSubmissionsByDataset(datasetId: String): List[BenchmarkSubmission]
  def getBenchmarkSubmissionsCountByBenchmark(benchmarkId: String): Int
  def getBenchmarkSubmissionsCountByDataset(datasetId: String): Int
}
