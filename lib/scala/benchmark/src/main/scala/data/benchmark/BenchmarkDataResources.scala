package data.benchmark

import java.io.InputStream

import data.DataResources
import formats.benchmark.{BenchmarkAnswersJsonlReader, BenchmarkQuestionsJsonlReader, BenchmarkSubmissionsJsonlReader, BenchmarksJsonlReader}
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkSubmission}

class BenchmarkDataResources(
                                    val benchmarkAnswersJsonlResourceName: String,
                                    val benchmarksJsonlResourceName: String,
                                    val benchmarkQuestionsJsonlResourceName: String,
                                    val benchmarkSubmissionsJsonlResourceName: String
) extends DataResources with WithResource {
  def getBenchmarkAnswersJsonlResourceAsStream(): InputStream =
    getResourceAsStream(benchmarkAnswersJsonlResourceName)

  def getBenchmarksJsonlResourceAsStream(): InputStream =
    getResourceAsStream(benchmarksJsonlResourceName)

  def getBenchmarkQuestionsJsonlResourceAsStream(): InputStream =
    getResourceAsStream(benchmarkQuestionsJsonlResourceName)

  def getBenchmarkSubmissionsJsonlResourceAsStream(): InputStream =
    getResourceAsStream(benchmarkSubmissionsJsonlResourceName)

  def readBenchmarkAnswers(): List[BenchmarkAnswer] = {
    withResource(BenchmarkAnswersJsonlReader.open(getBenchmarkAnswersJsonlResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }

  def readBenchmarks(): List[Benchmark] = {
    withResource(BenchmarksJsonlReader.open(getBenchmarksJsonlResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }

  def readBenchmarkQuestions(): List[BenchmarkQuestion] = {
    withResource(BenchmarkQuestionsJsonlReader.open(getBenchmarkQuestionsJsonlResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }

  def readBenchmarkSubmissions(): List[BenchmarkSubmission] = {
    withResource(BenchmarkSubmissionsJsonlReader.open(getBenchmarkSubmissionsJsonlResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }
}
