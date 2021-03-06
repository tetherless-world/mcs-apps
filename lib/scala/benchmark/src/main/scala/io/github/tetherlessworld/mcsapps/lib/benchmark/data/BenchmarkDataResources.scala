package io.github.tetherlessworld.mcsapps.lib.benchmark.data

import io.github.tetherlessworld.mcsapps.lib.benchmark.models.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkSubmission}
import io.github.tetherlessworld.mcsapps.lib.kg.data.DataResource
import io.github.tetherlessworld.mcsapps.lib.benchmark.formats.{BenchmarkAnswersJsonlIterator, BenchmarkQuestionsJsonlIterator, BenchmarkSubmissionsJsonlIterator, BenchmarksJsonlIterator}
import io.github.tetherlessworld.twxplore.lib.base.WithResource

class BenchmarkDataResources(
                                    val benchmarkAnswersJsonl: DataResource,
                                    val benchmarksJsonl: DataResource,
                                    val benchmarkQuestionsJsonl: DataResource,
                                    val benchmarkSubmissionsJsonl: DataResource
) extends WithResource {
  def readBenchmarkAnswers(): List[BenchmarkAnswer] = {
    withResource(BenchmarkAnswersJsonlIterator.open(benchmarkAnswersJsonl.getAsStream)) { iterator =>
      iterator.toList
    }
  }

  def readBenchmarks(): List[Benchmark] = {
    withResource(BenchmarksJsonlIterator.open(benchmarksJsonl.getAsStream)) { iterator =>
      iterator.toList
    }
  }

  def readBenchmarkQuestions(): List[BenchmarkQuestion] = {
    withResource(BenchmarkQuestionsJsonlIterator.open(benchmarkQuestionsJsonl.getAsStream)) { iterator =>
      iterator.toList
    }
  }

  def readBenchmarkSubmissions(): List[BenchmarkSubmission] = {
    withResource(BenchmarkSubmissionsJsonlIterator.open(benchmarkSubmissionsJsonl.getAsStream)) { iterator =>
      iterator.toList
    }
  }
}
