package io.github.tetherlessworld.mcsapps.lib.kg.formats.path

import java.io.InputStream

import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlReader
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgPath

import scala.io.Source

final class KgPathsJsonlReader(source: Source) extends JsonlReader[KgPath](source) {
  protected val decoder: Decoder[KgPath] = deriveDecoder
}

object KgPathsJsonlReader {
  def open(inputStream: InputStream): KgPathsJsonlReader =
    new KgPathsJsonlReader(JsonlReader.openSource(inputStream))
}
