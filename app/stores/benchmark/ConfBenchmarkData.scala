package stores.benchmark

object ConfBenchmarkData extends BenchmarkData(new BenchmarkDataResources(
  benchmarkAnswersJsonlResourceName = "/data/import/benchmark/benchmark_answers.jsonl",
  benchmarksJsonlResourceName = "/data/import/benchmark/benchmarks.jsonl",
  benchmarkQuestionsJsonlResourceName = "/data/import/benchmark/benchmark_questions.jsonl",
  benchmarkSubmissionsJsonlResourceName = "/data/import/benchmark/benchmark_submissions.jsonl"
))
