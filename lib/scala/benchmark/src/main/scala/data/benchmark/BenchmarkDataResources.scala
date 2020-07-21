package data.benchmark

import data.DataResource
import formats.benchmark.{BenchmarkAnswersJsonlReader, BenchmarkQuestionsJsonlReader, BenchmarkSubmissionsJsonlReader, BenchmarksJsonlReader}
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkSubmission}

class BenchmarkDataResources(
                                    val benchmarkAnswersJsonl: DataResource,
                                    val benchmarksJsonl: DataResource,
                                    val benchmarkQuestionsJsonl: DataResource,
                                    val benchmarkSubmissionsJsonl: DataResource
) extends WithResource {
  def readBenchmarkAnswers(): List[BenchmarkAnswer] = {
    withResource(BenchmarkAnswersJsonlReader.open(benchmarkAnswersJsonl.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }

  def readBenchmarks(): List[Benchmark] = {
    withResource(BenchmarksJsonlReader.open(benchmarksJsonl.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }

  def readBenchmarkQuestions(): List[BenchmarkQuestion] = {
    withResource(BenchmarkQuestionsJsonlReader.open(benchmarkQuestionsJsonl.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }

  def readBenchmarkSubmissions(): List[BenchmarkSubmission] = {
    withResource(BenchmarkSubmissionsJsonlReader.open(benchmarkSubmissionsJsonl.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }
}
