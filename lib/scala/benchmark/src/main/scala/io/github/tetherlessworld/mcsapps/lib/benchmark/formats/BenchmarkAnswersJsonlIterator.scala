package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import java.io.InputStream

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.benchmark.models._
import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlIterator

import scala.io.Source

final class BenchmarkAnswersJsonlIterator(source: Source) extends JsonlIterator[BenchmarkAnswer](source) {
  private implicit val benchmarkQuestionAnswerPathDecoder: Decoder[BenchmarkQuestionAnswerPath] = deriveDecoder
  private implicit val benchmarkQuestionAnswerPathsDecoder: Decoder[BenchmarkQuestionAnswerPaths] = deriveDecoder
  private implicit val benchmarkQuestionChoiceAnalysisDecoder: Decoder[BenchmarkQuestionChoiceAnalysis] = deriveDecoder
  private implicit val benchmarkAnswerExplanationDecoder: Decoder[BenchmarkAnswerExplanation] = deriveDecoder
  protected val decoder: Decoder[BenchmarkAnswer] = deriveDecoder
}

object BenchmarkAnswersJsonlIterator {
  def open(inputStream: InputStream): BenchmarkAnswersJsonlIterator =
    new BenchmarkAnswersJsonlIterator(JsonlIterator.openSource(inputStream))
}
