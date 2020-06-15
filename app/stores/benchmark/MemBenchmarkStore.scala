package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkQuestion, BenchmarkQuestionSet}

final class MemBenchmarkStore extends BenchmarkStore {
  private val benchmarks: List[Benchmark] = BenchmarkTestData.benchmarks
  private val benchmarkQuestionSets: List[BenchmarkQuestionSet] = BenchmarkTestData.benchmarkQuestionSets
  private val benchmarkQuestions: List[BenchmarkQuestion] = BenchmarkTestData.benchmarkQuestions

  override def getBenchmarks: List[Benchmark] = benchmarks

  override def getBenchmarkQuestionsBySet(benchmarkId: String, benchmarkQuestionSetId: String, limit: Int, offset: Int): List[BenchmarkQuestion] =
    benchmarkQuestions
      .filter(benchmarkQuestion => benchmarkQuestion.benchmarkId == benchmarkId && benchmarkQuestion.benchmarkQuestionSetId == benchmarkQuestionSetId)
      .drop(offset).take(limit)

  override def getBenchmarkQuestionSets(benchmarkId: String): List[BenchmarkQuestionSet] =
    benchmarkQuestionSets.filter(benchmarkQuestionSet => benchmarkQuestionSet.benchmarkId == benchmarkId)
}
