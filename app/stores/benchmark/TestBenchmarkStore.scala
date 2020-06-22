package stores.benchmark

final class TestBenchmarkStore extends MemBenchmarkStore(
  benchmarks = TestBenchmarkData.benchmarks,
  benchmarkAnswers = TestBenchmarkData.benchmarkAnswers,
  benchmarkQuestions = TestBenchmarkData.benchmarkQuestions,
  benchmarkSubmissions = TestBenchmarkData.benchmarkSubmissions,
)
