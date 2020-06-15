package formats.benchmark

import formats.JsonlReader
import io.circe.generic.semiauto.deriveDecoder
import io.circe.{Decoder, Json}
import models.benchmark.{BenchmarkAnswer, BenchmarkQuestion, BenchmarkQuestionChoice, BenchmarkSubmission}

import scala.io.Source

final class BenchmarkSubmissionsJsonlReader(source: Source) extends JsonlReader[BenchmarkSubmission](source) {
  protected final override def toStream(jsonl: Stream[Json]): Stream[BenchmarkSubmission] = {
    implicit val benchmarkAnswerDecoder: Decoder[BenchmarkAnswer] = deriveDecoder
    implicit val benchmarkSubmissionDecoder: Decoder[BenchmarkSubmission] = deriveDecoder
    jsonl.map(obj =>
      benchmarkSubmissionDecoder.decodeJson(obj) match {
        case Left(decodingFailure) => {
          throw decodingFailure
        }
        case Right(benchmarkQuestion) => benchmarkQuestion
      }
    )
  }
}
