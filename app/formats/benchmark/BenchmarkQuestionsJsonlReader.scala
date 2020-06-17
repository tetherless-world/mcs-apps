package formats.benchmark

import formats.JsonlReader
import io.circe.generic.semiauto.deriveDecoder
import io.circe.{Decoder, Json}
import models.benchmark.{BenchmarkQuestion, BenchmarkQuestionChoice, BenchmarkDataset}

import scala.io.Source

final class BenchmarkQuestionsJsonlReader(source: Source) extends JsonlReader[BenchmarkQuestion](source) {
  private implicit val benchmarkQuestionChoiceDecoder: Decoder[BenchmarkQuestionChoice] = deriveDecoder
  protected val decoder: Decoder[BenchmarkQuestion] = deriveDecoder
}
