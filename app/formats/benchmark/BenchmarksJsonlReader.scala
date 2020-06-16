package formats.benchmark

import formats.JsonlReader
import io.circe.{Decoder, Json}
import models.benchmark.{Benchmark, BenchmarkQuestionSet}
import io.circe.generic.semiauto.deriveDecoder

import scala.io.Source

final class BenchmarksJsonlReader(source: Source) extends JsonlReader[Benchmark](source) {
  final override protected def toStream(jsonl: Stream[Json]): Stream[Benchmark] = {
    implicit val benchmarkQuestionSetDecoder: Decoder[BenchmarkQuestionSet] = deriveDecoder
    implicit val benchmarkDecoder: Decoder[Benchmark] = deriveDecoder
    jsonl.map(obj =>
      benchmarkDecoder.decodeJson(obj) match {
        case Left(decodingFailure) => {
          throw decodingFailure
        }
        case Right(benchmark) => benchmark
      }
    )
  }
}
