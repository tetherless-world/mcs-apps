package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import java.io.InputStream

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.benchmark.models.{Benchmark, BenchmarkDataset}
import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlIterator

import scala.io.Source

final class BenchmarksJsonlIterator(source: Source) extends JsonlIterator[Benchmark](source) {
  private implicit val benchmarkDatasetDecoder: Decoder[BenchmarkDataset] = deriveDecoder
  protected val decoder: Decoder[Benchmark] = deriveDecoder
}

object BenchmarksJsonlIterator {
  def open(inputStream: InputStream): BenchmarksJsonlIterator =
    new BenchmarksJsonlIterator(JsonlIterator.openSource(inputStream))
}
