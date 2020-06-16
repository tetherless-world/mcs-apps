package models.benchmark

final case class BenchmarkQuestionAnswerPaths(
                                               endNodeId: String,
                                               startNodeId: String,
                                               paths: List[BenchmarkQuestionAnswerPath],
                                             )
