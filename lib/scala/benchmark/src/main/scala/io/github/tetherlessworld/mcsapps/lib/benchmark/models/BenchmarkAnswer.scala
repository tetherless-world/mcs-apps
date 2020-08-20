package io.github.tetherlessworld.mcsapps.lib.benchmark.models

final case class BenchmarkAnswer(choiceId: String, explanation: Option[BenchmarkAnswerExplanation], questionId: String, submissionId: String)
