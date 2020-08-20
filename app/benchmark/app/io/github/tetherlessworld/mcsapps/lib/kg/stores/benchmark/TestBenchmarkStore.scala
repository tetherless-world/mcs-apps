package io.github.tetherlessworld.mcsapps.lib.kg.stores.benchmark

import io.github.tetherlessworld.mcsapps.lib.kg.data.benchmark.TestBenchmarkData

final class TestBenchmarkStore extends MemBenchmarkStore(
  benchmarks = TestBenchmarkData.benchmarks,
  benchmarkAnswers = TestBenchmarkData.benchmarkAnswers,
  benchmarkQuestions = TestBenchmarkData.benchmarkQuestions,
  benchmarkSubmissions = TestBenchmarkData.benchmarkSubmissions,
)
