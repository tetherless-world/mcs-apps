package stores

import io.github.tetherlessworld.mcsapps.lib.benchmark.data.TestBenchmarkData

final class TestBenchmarkStore extends MemBenchmarkStore(
  benchmarks = TestBenchmarkData.benchmarks,
  benchmarkAnswers = TestBenchmarkData.benchmarkAnswers,
  benchmarkQuestions = TestBenchmarkData.benchmarkQuestions,
  benchmarkSubmissions = TestBenchmarkData.benchmarkSubmissions,
)
