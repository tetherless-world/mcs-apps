package formats.path

import io.circe.{Decoder, Json}
import io.circe.generic.semiauto.deriveDecoder
import io.circe.parser._
import models.path.Path
import org.slf4j.LoggerFactory

import scala.io.Source

abstract class JsonlReader[T] {
  private val logger = LoggerFactory.getLogger(getClass)

  final def read(jsonlFilePath: java.nio.file.Path): Stream[T] = {
    read(Source.fromFile(jsonlFilePath.toFile))
  }

  final def read(jsonlSource: Source): Stream[T] = {
    read(jsonlSource.getLines().toStream.flatMap(line => {
      val parseResult = parse(line)
      parseResult match {
        case Left(parsingFailure) => {
          logger.warn("error parsing path JSON: {}", parsingFailure)
          None
        }
        case Right(json) => {
          Some(json)
        }
      }
    }))
  }

  def read(jsonl: Stream[Json]): Stream[T]
}
