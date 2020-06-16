package models.benchmark

final case class BenchmarkAnswer(choiceLabel: String, explanation: Option[BenchmarkAnswerExplanation], questionId: String, submissionId: String)
