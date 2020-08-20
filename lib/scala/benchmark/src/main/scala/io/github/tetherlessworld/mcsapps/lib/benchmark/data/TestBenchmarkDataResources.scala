package io.github.tetherlessworld.mcsapps.lib.benchmark.data

import io.github.tetherlessworld.mcsapps.lib.kg.data.DataResource

object TestBenchmarkDataResources extends BenchmarkDataResources(
  benchmarkAnswersJsonl = DataResource("/io/github/tetherlessworld/mcsapps/lib/benchmark/data/test/benchmark_answers.jsonl.bz2"),
  benchmarksJsonl = DataResource("/io/github/tetherlessworld/mcsapps/lib/benchmark/data/test/benchmarks.jsonl.bz2"),
  benchmarkQuestionsJsonl = DataResource("/io/github/tetherlessworld/mcsapps/lib/benchmark/data/test/benchmark_questions.jsonl.bz2"),
  benchmarkSubmissionsJsonl = DataResource("/io/github/tetherlessworld/mcsapps/lib/benchmark/data/test/benchmark_submissions.jsonl.bz2")
)
