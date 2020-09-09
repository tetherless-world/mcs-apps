package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import java.io.InputStream

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.benchmark.models.BenchmarkSubmission
import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlIterator

import scala.io.Source

final class BenchmarkSubmissionsJsonlReader(source: Source) extends JsonlIterator[BenchmarkSubmission](source) {
  protected val decoder: Decoder[BenchmarkSubmission] = deriveDecoder
}

object BenchmarkSubmissionsJsonlReader {
  def open(inputStream: InputStream): BenchmarkSubmissionsJsonlReader =
    new BenchmarkSubmissionsJsonlReader(JsonlIterator.openSource(inputStream))
}
