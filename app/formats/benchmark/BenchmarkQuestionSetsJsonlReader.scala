package formats.benchmark

import formats.{JsonlReader}
import io.circe.generic.semiauto.deriveDecoder
import io.circe.{Decoder, Json}
import models.benchmark.{Benchmark, BenchmarkQuestionSet}

import scala.io.Source

final class BenchmarkQuestionSetsJsonlReader(source: Source) extends JsonlReader[BenchmarkQuestionSet](source) {
  protected final override def toStream(jsonl: Stream[Json]): Stream[BenchmarkQuestionSet] = {
    implicit val decoder: Decoder[BenchmarkQuestionSet] = deriveDecoder
    jsonl.map(obj =>
      decoder.decodeJson(obj) match {
        case Left(decodingFailure) => {
          throw decodingFailure
        }
        case Right(benchmarkQuestionSet) => benchmarkQuestionSet
      }
    )
  }
}
