package models.benchmark

final case class BenchmarkQuestionAnswerPaths(
                                               endNodeId: String,
                                               score: Float,
                                               startNodeId: String,
                                               paths: List[BenchmarkQuestionAnswerPath],
                                             )
