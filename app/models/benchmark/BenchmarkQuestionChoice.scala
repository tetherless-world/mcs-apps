package models.benchmark

final case class BenchmarkQuestionChoice(id: String, identifier: Option[String], position: Int, text: String, `type`: BenchmarkQuestionChoiceType)
