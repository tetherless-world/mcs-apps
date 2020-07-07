package stores.benchmark

import data.benchmark.TestBenchmarkData

final class TestBenchmarkStore extends MemBenchmarkStore(
  benchmarks = TestBenchmarkData.benchmarks,
  benchmarkAnswers = TestBenchmarkData.benchmarkAnswers,
  benchmarkQuestions = TestBenchmarkData.benchmarkQuestions,
  benchmarkSubmissions = TestBenchmarkData.benchmarkSubmissions,
)
