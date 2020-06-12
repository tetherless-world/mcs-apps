package formats.kg.path

import io.circe.generic.semiauto.deriveDecoder
import io.circe.{Decoder, Json}
import models.kg.KgPath
import org.slf4j.LoggerFactory

import scala.io.Source

final class PathJsonlReader(source: Source) extends JsonlReader[KgPath](source) {
  private val pathDecoder: Decoder[KgPath] = deriveDecoder
  private val logger = LoggerFactory.getLogger(getClass)

  final protected override def toStream(jsonl: Stream[Json]): Stream[KgPath] = {
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
