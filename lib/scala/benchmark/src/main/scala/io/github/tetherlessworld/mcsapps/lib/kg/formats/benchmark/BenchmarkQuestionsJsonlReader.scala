package io.github.tetherlessworld.mcsapps.lib.kg.formats.benchmark

import java.io.InputStream

import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlReader
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import models.benchmark.{BenchmarkQuestion, BenchmarkQuestionChoice, BenchmarkQuestionPrompt}

import scala.io.Source

final class BenchmarkQuestionsJsonlReader(source: Source) extends JsonlReader[BenchmarkQuestion](source) {
  private implicit val benchmarkQuestionChoiceDecoder: Decoder[BenchmarkQuestionChoice] = deriveDecoder
  private implicit val benchmarkQuestionPromptDecoder: Decoder[BenchmarkQuestionPrompt] = deriveDecoder
  protected val decoder: Decoder[BenchmarkQuestion] = deriveDecoder
}

object BenchmarkQuestionsJsonlReader {
  def open(inputStream: InputStream): BenchmarkQuestionsJsonlReader =
    new BenchmarkQuestionsJsonlReader(JsonlReader.openSource(inputStream))
}
