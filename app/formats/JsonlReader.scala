package formats

import io.circe.Json
import io.circe.parser._
import org.slf4j.LoggerFactory

import scala.io.Source

abstract class JsonlReader[T](source: Source) extends AutoCloseable {
  private val logger = LoggerFactory.getLogger(getClass)

  final override def close(): Unit =
    source.close()

  final def toStream: Stream[T] =
    toStream(source.getLines().toStream.flatMap(line => {
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

  protected def toStream(jsonl: Stream[Json]): Stream[T]
}