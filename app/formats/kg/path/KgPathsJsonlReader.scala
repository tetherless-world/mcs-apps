package formats.kg.path

import java.io.InputStream

import formats.JsonlReader
import formats.kg.path
import io.circe.generic.semiauto.deriveDecoder
import io.circe.{Decoder, Json}
import models.kg.KgPath
import org.slf4j.LoggerFactory

import scala.io.Source

final class KgPathsJsonlReader(source: Source) extends JsonlReader[KgPath](source) {
  protected val decoder: Decoder[KgPath] = deriveDecoder
}

object KgPathsJsonlReader {
  def open(inputStream: InputStream): KgPathsJsonlReader =
    new path.KgPathsJsonlReader(JsonlReader.openSource(inputStream))
}
