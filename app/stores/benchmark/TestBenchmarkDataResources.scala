package stores.benchmark

object TestBenchmarkDataResources extends BenchmarkDataResources(
  benchmarkAnswersJsonlResourceName = "/data/test/benchmark/benchmark_answers.jsonl",
  benchmarksJsonlResourceName = "/data/test/benchmark/benchmarks.jsonl",
  benchmarkQuestionsJsonlResourceName = "/data/test/benchmark/benchmark_questions.jsonl",
  benchmarkSubmissionsJsonlResourceName = "/data/test/benchmark/benchmark_submissions.jsonl"
)
