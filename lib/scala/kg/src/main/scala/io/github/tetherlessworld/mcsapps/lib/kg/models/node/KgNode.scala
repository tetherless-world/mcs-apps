package io.github.tetherlessworld.mcsapps.lib.kg.models.node

final case class KgNode(
                         id: String,
                         inDegree: Option[Int],
                         labels: List[String],
                         outDegree: Option[Int],
                         pageRank: Option[Double],
                         pos: Option[Char],
                         sourceIds: List[String],
                         wordNetSenseNumber: Option[Int]
                       )
