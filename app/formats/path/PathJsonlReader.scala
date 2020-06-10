package formats.path

import io.circe.{Decoder, Json}
import io.circe.generic.semiauto.deriveDecoder
import io.circe.parser._
import models.path.Path
import org.slf4j.LoggerFactory

import scala.io.Source

final class PathJsonlReader extends JsonlReader[Path] {
  private val pathDecoder: Decoder[Path] = deriveDecoder
  private val logger = LoggerFactory.getLogger(getClass)

  final override def read(jsonl: Stream[Json]): Stream[Path] = {
    jsonl.flatMap(json => {
      val decodeResult = pathDecoder.decodeJson(json)
      decodeResult match {
        case Left(decodingFailure) => {
          logger.warn("error decoding path JSON: {}", decodingFailure)
          None
        }
        case Right(path) => Some(path)
      }
    })
  }
}
