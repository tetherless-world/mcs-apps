package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkQuestion, BenchmarkQuestionSet}

trait BenchmarkStore {
  def getBenchmarks: List[Benchmark]
  def getBenchmarkById(benchmarkId: String): Option[Benchmark]
  def getBenchmarkQuestionsBySet(benchmarkId: String, benchmarkQuestionSetId: String, limit: Int, offset: Int): List[BenchmarkQuestion]
}
