package stores.benchmark

import java.io.{BufferedInputStream, InputStream}

import formats.benchmark.{BenchmarkAnswersJsonlReader, BenchmarkQuestionsJsonlReader, BenchmarkSubmissionsJsonlReader, BenchmarksJsonlReader}
import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkSubmission}
import stores.{DataResources, WithResource}

import scala.io.Source

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
