package stores.benchmark

import java.io.{BufferedInputStream, InputStream}

import formats.benchmark.{BenchmarkAnswersJsonlReader, BenchmarkQuestionsJsonlReader, BenchmarkSubmissionsJsonlReader, BenchmarksJsonlReader}
import formats.kg.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.kg.path.KgPathsJsonlReader
import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkQuestionSet, BenchmarkSubmission}
import models.kg.{KgEdge, KgNode, KgPath}
import stores.WithResource

import scala.io.Source

object BenchmarkTestData extends WithResource {
  val BenchmarkAnswersJsonlResourceName = "/test_data/benchmark/benchmark_answers.jsonl"
  val BenchmarksJsonlResourceName = "/test_data/benchmark/benchmarks.jsonl"
  val BenchmarkQuestionsJsonlResourceName = "/test_data/benchmark/benchmark_questions.jsonl"
  val BenchmarkQuestionSetsJsonlResourceName = "/test_data/benchmark/benchmark_question_sets.jsonl"
  val BenchmarkSubmissionsJsonlResourceName = "/test_data/benchmark/benchmark_submissions.jsonl"

  val benchmarks = readBenchmarks()
  val benchmarkAnswers = readBenchmarkAnswers()
  val benchmarkQuestions = readBenchmarkQuestions()
  val benchmarkSubmissions = readBenchmarkSubmissions()
  validate()

  def getBenchmarkAnswersJsonlResourceAsStream(): InputStream =
    getResourceAsStream(BenchmarkAnswersJsonlResourceName)

  def getBenchmarksJsonlResourceAsStream(): InputStream =
    getResourceAsStream(BenchmarksJsonlResourceName)

  def getBenchmarkQuestionsJsonlResourceAsStream(): InputStream =
    getResourceAsStream(BenchmarkQuestionsJsonlResourceName)

  def getBenchmarkSubmissionsJsonlResourceAsStream(): InputStream =
    getResourceAsStream(BenchmarkSubmissionsJsonlResourceName)

  private def getResourceAsStream(resourceName: String) =
    new BufferedInputStream(getClass.getResourceAsStream(resourceName))

  private def readBenchmarkAnswers(): List[BenchmarkAnswer] = {
    withResource(new BenchmarkAnswersJsonlReader(Source.fromInputStream(getBenchmarkAnswersJsonlResourceAsStream()))) { reader =>
      reader.toStream.toList
    }
  }

  private def readBenchmarks(): List[Benchmark] = {
    withResource(new BenchmarksJsonlReader(Source.fromInputStream(getBenchmarksJsonlResourceAsStream()))) { reader =>
      reader.toStream.toList
    }
  }

  private def readBenchmarkQuestions(): List[BenchmarkQuestion] = {
    withResource(new BenchmarkQuestionsJsonlReader(Source.fromInputStream(getBenchmarkQuestionsJsonlResourceAsStream()))) { reader =>
      reader.toStream.toList
    }
  }

  private def readBenchmarkSubmissions(): List[BenchmarkSubmission] = {
    withResource(new BenchmarkSubmissionsJsonlReader(Source.fromInputStream(getBenchmarkSubmissionsJsonlResourceAsStream()))) { reader =>
      reader.toStream.toList
    }
  }

  private def validate(): Unit = {
    if (benchmarks.map(benchmark => benchmark.id).toSet.size != benchmarks.size) {
      throw new IllegalArgumentException("benchmarks do not have unique id's")
    }
    val questionSets = benchmarks.flatMap(benchmark => benchmark.questionSets)
    if (questionSets.map(questionSet => questionSet.id).toSet.size != questionSets.size) {
      throw new IllegalArgumentException("benchmark question sets do not have unique id's")
    }
    if (benchmarkQuestions.map(question => question.id).toSet.size != benchmarkQuestions.size) {
      throw new IllegalArgumentException("benchmark questions do not have unique id's")
    }
    if (benchmarkSubmissions.map(submission => submission.id).toSet.size != benchmarkSubmissions.size) {
      throw new IllegalArgumentException("benchmark submissions do not have unique id's")
    }

    for (question <- benchmarkQuestions) {
      val benchmark = benchmarks.find(benchmark => benchmark.questionSets.exists(questionSet => questionSet.id == question.questionSetId))
      if (!benchmark.isDefined) {
        throw new IllegalArgumentException(s"benchmark question ${question.id} refers to missing benchmark question set ${question.questionSetId}")
      }
      if (!benchmark.get.questionSets.exists(questionSet => question.questionSetId == questionSet.id)) {
        throw new IllegalArgumentException(s"benchmark question ${question.id} refers to missing benchmark question set ${question.questionSetId}")
      }
    }

    for (submission <- benchmarkSubmissions) {
      val benchmark = benchmarks.find(benchmark => benchmark.questionSets.exists(questionSet => questionSet.id == submission.questionSetId))
      if (!benchmark.isDefined) {
        throw new IllegalArgumentException(s"submission ${submission.id} refers to missing benchmark question set ${submission.questionSetId}")
      }
      if (!benchmark.get.questionSets.exists(questionSet => submission.questionSetId == questionSet.id)) {
        throw new IllegalArgumentException(s"benchmark question ${submission.id} refers to missing benchmark question set ${submission.questionSetId}")
      }
    }
    for (answer <- benchmarkAnswers) {
      val submission = benchmarkSubmissions.find(submission => submission.id == answer.submissionId)
      if (!submission.isDefined) {
        throw new IllegalArgumentException(s"answer refers to missing submission ${answer.submissionId}")
      }
      val question =
        benchmarkQuestions.find(
          question => question.id == answer.questionId &&
            question.questionSetId == submission.get.questionSetId)
      if (!question.isDefined) {
        throw new IllegalArgumentException(s"answer refers to missing question ${answer.questionId}")
      }
      if (!question.get.choices.exists(choice => choice.label == answer.choiceLabel)) {
        throw new IllegalArgumentException(s"answer refers to missing choice ${answer.choiceLabel}")
      }
    }
  }
}
