package stores.benchmark

import java.io.{BufferedInputStream, InputStream}

import formats.benchmark.{BenchmarkQuestionSetsJsonlReader, BenchmarkQuestionsJsonlReader, BenchmarksJsonlReader}
import formats.kg.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.kg.path.KgPathsJsonlReader
import models.benchmark.{Benchmark, BenchmarkQuestion, BenchmarkQuestionSet}
import models.kg.{KgEdge, KgNode, KgPath}
import stores.WithResource

import scala.io.Source

object BenchmarkTestData extends WithResource {
  val BenchmarksJsonlResourceName = "/test_data/benchmark/benchmarks.jsonl"
  val BenchmarkQuestionsJsonlResourceName = "/test_data/benchmark/benchmark_questions.jsonl"
  val BenchmarkQuestionSetsJsonlResourceName = "/test_data/benchmark/benchmark_question_sets.jsonl"

  val benchmarks = readBenchmarks()
  val benchmarkQuestions = readBenchmarkQuestions()
  val benchmarkQuestionSets = readBenchmarkQuestionSets()
  validate()

  def getBenchmarksJsonResourceAsStream(): InputStream =
    getResourceAsStream(BenchmarksJsonlResourceName)

  def getBenchmarkQuestionsJsonResourceAsStream(): InputStream =
    getResourceAsStream(BenchmarkQuestionsJsonlResourceName)

  def getBenchmarkQuestionSetsJsonResourceAsStream(): InputStream =
    getResourceAsStream(BenchmarkQuestionSetsJsonlResourceName)

  private def getResourceAsStream(resourceName: String) =
    new BufferedInputStream(getClass.getResourceAsStream(resourceName))

  private def readBenchmarks(): List[Benchmark] = {
    withResource(new BenchmarksJsonlReader(Source.fromInputStream(getBenchmarksJsonResourceAsStream()))) { reader =>
      reader.toStream.toList
    }
  }

  private def readBenchmarkQuestions(): List[BenchmarkQuestion] = {
    withResource(new BenchmarkQuestionsJsonlReader(Source.fromInputStream(getBenchmarkQuestionsJsonResourceAsStream()))) { reader =>
      reader.toStream.toList
    }
  }

  private def readBenchmarkQuestionSets(): List[BenchmarkQuestionSet] = {
    withResource(new BenchmarkQuestionSetsJsonlReader(Source.fromInputStream(getBenchmarkQuestionSetsJsonResourceAsStream()))) { reader =>
      reader.toStream.toList
    }
  }

  private def validate(): Unit = {
    for (question <- benchmarkQuestions) {
      if (!benchmarkQuestionSets.exists(questionSet => question.benchmarkQuestionSetId == questionSet.id)) {
        throw new IllegalArgumentException(s"benchmark question ${question.id} refers to missing benchmark question set ${question.benchmarkQuestionSetId}")
      }
      if (!benchmarks.exists(benchmark => question.benchmarkId == benchmark.id)) {
        throw new IllegalArgumentException(s"benchmark question ${question.id} refers to missing benchmark ${question.benchmarkId}")
      }
    }
  }
}
