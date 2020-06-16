package formats

import io.circe.{Decoder, Json}
import io.circe.parser._
import org.slf4j.LoggerFactory

import scala.io.Source

abstract class JsonlReader[T](source: Source) extends AutoCloseable with Iterable[T] {
  private val logger = LoggerFactory.getLogger(getClass)

  protected val decoder: Decoder[T]

  final override def close(): Unit =
    source.close()

  final def iterator: Iterator[T] =
    iterator(source.getLines().flatMap(line => {
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

  protected def iterator(jsonl: Iterator[Json]): Iterator[T] = {
    jsonl.map(obj =>
      decoder.decodeJson(obj) match {
        case Left(decodingFailure) => {
          throw decodingFailure
        }
        case Right(benchmarkQuestion) => benchmarkQuestion
      }
    )
  }
}
