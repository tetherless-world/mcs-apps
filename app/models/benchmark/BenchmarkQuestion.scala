package models.benchmark

final case class BenchmarkQuestion(
                                    benchmarkId: String,
                                    benchmarkQuestionSetId: String,
                                    choices: List[BenchmarkQuestionChoice],
                                    concept: Option[String],
                                    id: String,
                                    text: String
                                  )
