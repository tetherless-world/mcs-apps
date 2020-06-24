package models.benchmark

final case class BenchmarkAnswer(choiceId: String, explanation: Option[BenchmarkAnswerExplanation], questionId: String, submissionId: String)
