package formats.benchmark

import formats.JsonlReader
import io.circe.{Decoder, Json}
import models.benchmark.{Benchmark, BenchmarkQuestionSet}
import io.circe.generic.semiauto.deriveDecoder

import scala.io.Source

final class BenchmarksJsonlReader(source: Source) extends JsonlReader[Benchmark](source) {
  private implicit val benchmarkQuestionSetDecoder: Decoder[BenchmarkQuestionSet] = deriveDecoder
  protected val decoder: Decoder[Benchmark] = deriveDecoder
}
