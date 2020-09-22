package io.github.tetherlessworld.mcsapps.lib.kg.formats.path

import java.io.InputStream

import io.github.tetherlessworld.mcsapps.lib.kg.formats.JsonlIterator
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath

import scala.io.Source

final class KgPathsJsonlIterator(source: Source) extends JsonlIterator[KgPath](source) {
  protected val decoder: Decoder[KgPath] = deriveDecoder
}

object KgPathsJsonlIterator {
  def open(inputStream: InputStream): KgPathsJsonlIterator =
    new KgPathsJsonlIterator(JsonlIterator.openSource(inputStream))
}
