package stores.benchmark

import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkQuestion, BenchmarkSubmission}

class BenchmarkData(val benchmarks: List[Benchmark], val benchmarkAnswers: List[BenchmarkAnswer], val benchmarkQuestions: List[BenchmarkQuestion], val benchmarkSubmissions: List[BenchmarkSubmission]) {
  def this(resources: BenchmarkDataResources) =
    this(
      benchmarks = resources.readBenchmarks(),
      benchmarkAnswers = resources.readBenchmarkAnswers(),
      benchmarkQuestions = resources.readBenchmarkQuestions(),
      benchmarkSubmissions = resources.readBenchmarkSubmissions()
    )

  validate()

  private def validate(): Unit = {
    if (benchmarks.map(benchmark => benchmark.id).toSet.size != benchmarks.size) {
      throw new IllegalArgumentException("benchmarks do not have unique id's")
    }
    val datasets = benchmarks.flatMap(benchmark => benchmark.datasets)
    if (datasets.map(dataset => dataset.id).toSet.size != datasets.size) {
      throw new IllegalArgumentException("benchmark question sets do not have unique id's")
    }
    if (benchmarkQuestions.map(question => question.id).toSet.size != benchmarkQuestions.size) {
      throw new IllegalArgumentException("benchmark questions do not have unique id's")
    }
    if (benchmarkSubmissions.map(submission => submission.id).toSet.size != benchmarkSubmissions.size) {
      throw new IllegalArgumentException("benchmark submissions do not have unique id's")
    }

    for (question <- benchmarkQuestions) {
      val benchmark = benchmarks.find(benchmark => benchmark.datasets.exists(dataset => dataset.id == question.datasetId))
      if (!benchmark.isDefined) {
        throw new IllegalArgumentException(s"benchmark question ${question.id} refers to missing benchmark question set ${question.datasetId}")
      }
      if (!benchmark.get.datasets.exists(dataset => question.datasetId == dataset.id)) {
        throw new IllegalArgumentException(s"benchmark question ${question.id} refers to missing benchmark question set ${question.datasetId}")
      }
    }

    for (submission <- benchmarkSubmissions) {
      val benchmark = benchmarks.find(benchmark => benchmark.datasets.exists(dataset => dataset.id == submission.datasetId))
      if (!benchmark.isDefined) {
        throw new IllegalArgumentException(s"submission ${submission.id} refers to missing benchmark question set ${submission.datasetId}")
      }
      if (!benchmark.get.datasets.exists(dataset => submission.datasetId == dataset.id)) {
        throw new IllegalArgumentException(s"benchmark question ${submission.id} refers to missing benchmark question set ${submission.datasetId}")
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
            question.datasetId == submission.get.datasetId)
      if (!question.isDefined) {
        throw new IllegalArgumentException(s"answer refers to missing question ${answer.questionId}")
      }
      if (!question.get.choices.exists(choice => choice.id == answer.choiceId)) {
        throw new IllegalArgumentException(s"answer refers to missing choice ${answer.choiceId}")
      }
    }
  }
}
