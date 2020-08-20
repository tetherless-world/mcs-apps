package io.github.tetherlessworld.mcsapps.lib.benchmark.models

final case class BenchmarkQuestionAnswerPaths(
                                               endNodeId: String,
                                               score: Float,
                                               startNodeId: String,
                                               paths: List[BenchmarkQuestionAnswerPath],
                                             )
