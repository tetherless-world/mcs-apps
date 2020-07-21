package stores.benchmark

import data.DataResource
import data.benchmark.{BenchmarkData, BenchmarkDataResources}

object ConfBenchmarkData extends BenchmarkData(new BenchmarkDataResources(
  benchmarkAnswersJsonl = DataResource("/data/import/benchmark/benchmark_answers.jsonl.bz2"),
  benchmarksJsonl = DataResource("/data/import/benchmark/benchmarks.jsonl.bz2"),
  benchmarkQuestionsJsonl = DataResource("/data/import/benchmark/benchmark_questions.jsonl.bz2"),
  benchmarkSubmissionsJsonl = DataResource("/data/import/benchmark/benchmark_submissions.jsonl.bz2")
))
