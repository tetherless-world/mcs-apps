package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import java.io.InputStream

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.benchmark.models.BenchmarkSubmission
import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlIterator

import scala.io.Source

final class BenchmarkSubmissionsJsonlIterator(source: Source) extends JsonlIterator[BenchmarkSubmission](source) {
  protected val decoder: Decoder[BenchmarkSubmission] = deriveDecoder
}

object BenchmarkSubmissionsJsonlIterator {
  def open(inputStream: InputStream): BenchmarkSubmissionsJsonlIterator =
    new BenchmarkSubmissionsJsonlIterator(JsonlIterator.openSource(inputStream))
}
