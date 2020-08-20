package io.github.tetherlessworld.mcsapps.lib.kg.formats.benchmark

import java.io.InputStream

import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlReader
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import models.benchmark.BenchmarkSubmission

import scala.io.Source

final class BenchmarkSubmissionsJsonlReader(source: Source) extends JsonlReader[BenchmarkSubmission](source) {
  protected val decoder: Decoder[BenchmarkSubmission] = deriveDecoder
}

object BenchmarkSubmissionsJsonlReader {
  def open(inputStream: InputStream): BenchmarkSubmissionsJsonlReader =
    new BenchmarkSubmissionsJsonlReader(JsonlReader.openSource(inputStream))
}
