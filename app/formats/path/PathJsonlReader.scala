package formats.path

import io.circe.{Decoder, Json}
import io.circe.generic.semiauto.deriveDecoder
import io.circe.parser._
import models.path.Path
import org.slf4j.LoggerFactory

import scala.io.Source

final class PathJsonlReader(source: Source) extends JsonlReader[Path](source) {
  private val pathDecoder: Decoder[Path] = deriveDecoder
  private val logger = LoggerFactory.getLogger(getClass)

  final protected override def toStream(jsonl: Stream[Json]): Stream[Path] = {
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
