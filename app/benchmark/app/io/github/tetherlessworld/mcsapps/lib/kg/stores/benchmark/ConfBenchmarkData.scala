package io.github.tetherlessworld.mcsapps.lib.kg.stores.benchmark

import io.github.tetherlessworld.mcsapps.lib.kg.data.DataResource
import io.github.tetherlessworld.mcsapps.lib.kg.data.benchmark.{BenchmarkData, BenchmarkDataResources}

object ConfBenchmarkData extends BenchmarkData(new BenchmarkDataResources(
  benchmarkAnswersJsonl = DataResource("/data/import/benchmark/benchmark_answers.jsonl.bz2"),
  benchmarksJsonl = DataResource("/data/import/benchmark/benchmarks.jsonl.bz2"),
  benchmarkQuestionsJsonl = DataResource("/data/import/benchmark/benchmark_questions.jsonl.bz2"),
  benchmarkSubmissionsJsonl = DataResource("/data/import/benchmark/benchmark_submissions.jsonl.bz2")
))
