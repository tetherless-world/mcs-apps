package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkQuestion, BenchmarkQuestionSet}

class MemBenchmarkStore extends BenchmarkStore {
  private val benchmarks: List[Benchmark] = BenchmarkTestData.benchmarks
  private val benchmarkQuestions: List[BenchmarkQuestion] = BenchmarkTestData.benchmarkQuestions

  override def getBenchmarks: List[Benchmark] = benchmarks

  override def getBenchmarkById(benchmarkId: String): Option[Benchmark] =
    benchmarks.find(benchmark => benchmark.id == benchmarkId)

  override def getBenchmarkQuestionsBySet(benchmarkId: String, benchmarkQuestionSetId: String, limit: Int, offset: Int): List[BenchmarkQuestion] =
    benchmarkQuestions
      .filter(benchmarkQuestion => benchmarkQuestion.benchmarkId == benchmarkId && benchmarkQuestion.questionSetId == benchmarkQuestionSetId)
      .drop(offset).take(limit)
}
