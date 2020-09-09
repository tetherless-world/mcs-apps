package io.github.tetherlessworld.mcsapps.lib.benchmark.formats

import java.io.InputStream

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.benchmark.models.{Benchmark, BenchmarkDataset}
import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlIterator

import scala.io.Source

final class BenchmarksJsonlReader(source: Source) extends JsonlIterator[Benchmark](source) {
  private implicit val benchmarkDatasetDecoder: Decoder[BenchmarkDataset] = deriveDecoder
  protected val decoder: Decoder[Benchmark] = deriveDecoder
}

object BenchmarksJsonlReader {
  def open(inputStream: InputStream): BenchmarksJsonlReader =
    new BenchmarksJsonlReader(JsonlIterator.openSource(inputStream))
}
