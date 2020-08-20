package io.github.tetherlessworld.mcsapps.lib.kg.data.benchmark

import io.github.tetherlessworld.mcsapps.lib.kg.data.DataResource

object TestBenchmarkDataResources extends BenchmarkDataResources(
  benchmarkAnswersJsonl = DataResource("/data/test/benchmark/benchmark_answers.jsonl.bz2"),
  benchmarksJsonl = DataResource("/data/test/benchmark/benchmarks.jsonl.bz2"),
  benchmarkQuestionsJsonl = DataResource("/data/test/benchmark/benchmark_questions.jsonl.bz2"),
  benchmarkSubmissionsJsonl = DataResource("/data/test/benchmark/benchmark_submissions.jsonl.bz2")
)
