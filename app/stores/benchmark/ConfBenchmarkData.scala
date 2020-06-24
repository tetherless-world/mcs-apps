package stores.benchmark

object ConfBenchmarkData extends BenchmarkData(new BenchmarkDataResources(
  benchmarkAnswersJsonlResourceName = "/data/import/benchmark/benchmark_answers.jsonl.bz2",
  benchmarksJsonlResourceName = "/data/import/benchmark/benchmarks.jsonl",
  benchmarkQuestionsJsonlResourceName = "/data/import/benchmark/benchmark_questions.jsonl.bz2",
  benchmarkSubmissionsJsonlResourceName = "/data/import/benchmark/benchmark_submissions.jsonl"
))
