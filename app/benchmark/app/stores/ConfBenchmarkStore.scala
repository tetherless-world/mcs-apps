package stores

final class ConfBenchmarkStore extends MemBenchmarkStore(
  benchmarks = ConfBenchmarkData.benchmarks,
  benchmarkAnswers = ConfBenchmarkData.benchmarkAnswers,
  benchmarkQuestions = ConfBenchmarkData.benchmarkQuestions,
  benchmarkSubmissions = ConfBenchmarkData.benchmarkSubmissions
) {
}
