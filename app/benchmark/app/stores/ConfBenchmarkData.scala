package stores

import io.github.tetherlessworld.mcsapps.lib.benchmark.data.{BenchmarkData, BenchmarkDataResources}
import io.github.tetherlessworld.mcsapps.lib.kg.data.DataResource

object ConfBenchmarkData extends BenchmarkData(new BenchmarkDataResources(
  benchmarkAnswersJsonl = DataResource("/data/benchmark_answers.jsonl.bz2"),
  benchmarksJsonl = DataResource("/data/benchmarks.jsonl.bz2"),
  benchmarkQuestionsJsonl = DataResource("/data/benchmark_questions.jsonl.bz2"),
  benchmarkSubmissionsJsonl = DataResource("/data/benchmark_submissions.jsonl.bz2")
))
