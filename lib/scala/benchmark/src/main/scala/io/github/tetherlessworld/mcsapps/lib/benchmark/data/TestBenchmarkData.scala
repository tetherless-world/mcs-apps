package io.github.tetherlessworld.mcsapps.lib.benchmark.data

object TestBenchmarkData extends BenchmarkData(TestBenchmarkDataResources) {
  val benchmark = benchmarks(0)
  val benchmarkDataset = benchmark.datasets(0)
  val benchmarkQuestion = benchmarkQuestions.find(question => question.datasetId == benchmarkDataset.id).get
  val benchmarkSubmission = benchmarkSubmissions.find(submission => submission.benchmarkId == benchmark.id && submission.datasetId == benchmarkDataset.id).get
  val benchmarkAnswer = benchmarkAnswers.find(answer => answer.questionId == benchmarkQuestion.id && answer.submissionId == benchmarkSubmission.id).get
}
