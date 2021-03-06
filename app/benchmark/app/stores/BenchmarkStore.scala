package stores

import io.github.tetherlessworld.mcsapps.lib.benchmark.models.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkSubmission}

trait BenchmarkStore {
  def getBenchmarks: List[Benchmark]

  def getBenchmarkAnswerByQuestion(benchmarkQuestionId: String, benchmarkSubmissionId: String): Option[BenchmarkAnswer]

  def getBenchmarkAnswersByQuestion(benchmarkQuestionId: String): List[BenchmarkAnswer]

  def getBenchmarkAnswersBySubmission(benchmarkSubmissionId: String, limit: Int, offset: Int): List[BenchmarkAnswer]

  def getBenchmarkById(benchmarkId: String): Option[Benchmark]

  def getBenchmarkQuestionById(benchmarkQuestionId: String): Option[BenchmarkQuestion]

  def getBenchmarkQuestionsCountByDataset(benchmarkDatasetId: String): Int

  def getBenchmarkQuestionsByDataset(benchmarkDatasetId: String, limit: Int, offset: Int): List[BenchmarkQuestion]

  def getBenchmarkSubmissionsByBenchmark(benchmarkId: String): List[BenchmarkSubmission]

  def getBenchmarkSubmissionById(benchmarkSubmissionId: String): Option[BenchmarkSubmission]

  def getBenchmarkSubmissionsByDataset(benchmarkDatasetId: String): List[BenchmarkSubmission]

  def getBenchmarkSubmissionsCountByBenchmark(benchmarkId: String): Int

  def getBenchmarkSubmissionsCountByDataset(benchmarkDatasetId: String): Int
}
