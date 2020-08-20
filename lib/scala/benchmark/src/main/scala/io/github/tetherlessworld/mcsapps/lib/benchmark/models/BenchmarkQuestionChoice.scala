package io.github.tetherlessworld.mcsapps.lib.benchmark.models

final case class BenchmarkQuestionChoice(id: String, identifier: Option[String], position: Int, text: String, `type`: BenchmarkQuestionChoiceType)
