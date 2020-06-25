package formats.benchmark

import java.io.InputStream

import formats.JsonlReader
import io.circe.generic.semiauto.deriveDecoder
import io.circe.{Decoder, Json}
import models.benchmark.{BenchmarkAnswer, BenchmarkQuestion, BenchmarkQuestionChoice, BenchmarkSubmission}

import scala.io.Source

final class BenchmarkSubmissionsJsonlReader(source: Source) extends JsonlReader[BenchmarkSubmission](source) {
  protected val decoder: Decoder[BenchmarkSubmission] = deriveDecoder
}

object BenchmarkSubmissionsJsonlReader {
  def open(inputStream: InputStream): BenchmarkSubmissionsJsonlReader =
    new BenchmarkSubmissionsJsonlReader(JsonlReader.openSource(inputStream))
}
