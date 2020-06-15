package formats.benchmark

import formats.JsonlReader
import io.circe.generic.semiauto.deriveDecoder
import io.circe.{Decoder, Json}
import models.benchmark.{BenchmarkQuestion, BenchmarkQuestionChoice, BenchmarkQuestionSet}

import scala.io.Source

final class BenchmarkQuestionsJsonlReader(source: Source) extends JsonlReader[BenchmarkQuestion](source) {
  protected final override def toStream(jsonl: Stream[Json]): Stream[BenchmarkQuestion] = {
    implicit val benchmarkQuestionChoiceDecoder: Decoder[BenchmarkQuestionChoice] = deriveDecoder
    implicit val benchmarkQuestionDecoder: Decoder[BenchmarkQuestion] = deriveDecoder
    jsonl.map(obj =>
      benchmarkQuestionDecoder.decodeJson(obj) match {
        case Left(decodingFailure) => {
          throw decodingFailure
        }
        case Right(benchmarkQuestion) => benchmarkQuestion
      }
    )
  }
}
