package io.github.tetherlessworld.mcsapps.lib.kg.formats.benchmark

import java.io.InputStream

import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlReader
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import models.benchmark._

import scala.io.Source

final class BenchmarkAnswersJsonlReader(source: Source) extends JsonlReader[BenchmarkAnswer](source) {
  private implicit val benchmarkQuestionAnswerPathDecoder: Decoder[BenchmarkQuestionAnswerPath] = deriveDecoder
  private implicit val benchmarkQuestionAnswerPathsDecoder: Decoder[BenchmarkQuestionAnswerPaths] = deriveDecoder
  private implicit val benchmarkQuestionChoiceAnalysisDecoder: Decoder[BenchmarkQuestionChoiceAnalysis] = deriveDecoder
  private implicit val benchmarkAnswerExplanationDecoder: Decoder[BenchmarkAnswerExplanation] = deriveDecoder
  protected val decoder: Decoder[BenchmarkAnswer] = deriveDecoder
}

object BenchmarkAnswersJsonlReader {
  def open(inputStream: InputStream): BenchmarkAnswersJsonlReader =
    new BenchmarkAnswersJsonlReader(JsonlReader.openSource(inputStream))
}
