package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import java.io.InputStream

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.benchmark.models.{BenchmarkQuestion, BenchmarkQuestionChoice, BenchmarkQuestionPrompt}
import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlReader

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
