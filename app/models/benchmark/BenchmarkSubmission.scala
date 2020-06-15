package models.benchmark

final case class BenchmarkSubmission(answers: List[BenchmarkAnswer], benchmarkId: String, id: String, questionSetId: String)
