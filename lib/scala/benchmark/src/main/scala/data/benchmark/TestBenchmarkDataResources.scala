package data.benchmark

object TestBenchmarkDataResources extends BenchmarkDataResources(
  benchmarkAnswersJsonlResourceName = "/data/test/benchmark/benchmark_answers.jsonl.bz2",
  benchmarksJsonlResourceName = "/data/test/benchmark/benchmarks.jsonl.bz2",
  benchmarkQuestionsJsonlResourceName = "/data/test/benchmark/benchmark_questions.jsonl.bz2",
  benchmarkSubmissionsJsonlResourceName = "/data/test/benchmark/benchmark_submissions.jsonl.bz2"
)
