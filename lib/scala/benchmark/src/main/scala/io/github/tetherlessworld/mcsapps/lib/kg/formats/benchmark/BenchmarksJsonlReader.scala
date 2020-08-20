package io.github.tetherlessworld.mcsapps.lib.kg.formats.benchmark

import java.io.InputStream

import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlReader
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import models.benchmark.{Benchmark, BenchmarkDataset}

import scala.io.Source

final class BenchmarksJsonlReader(source: Source) extends JsonlReader[Benchmark](source) {
  private implicit val benchmarkDatasetDecoder: Decoder[BenchmarkDataset] = deriveDecoder
  protected val decoder: Decoder[Benchmark] = deriveDecoder
}

object BenchmarksJsonlReader {
  def open(inputStream: InputStream): BenchmarksJsonlReader =
    new BenchmarksJsonlReader(JsonlReader.openSource(inputStream))
}
