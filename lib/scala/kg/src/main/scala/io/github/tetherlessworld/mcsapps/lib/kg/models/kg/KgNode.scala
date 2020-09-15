package io.github.tetherlessworld.mcsapps.lib.kg.models.kg

final case class KgNode(
                         id: String,
                         labels: List[String],
                         pageRank: Option[Double],
                         pos: Option[Char],
                         sourceIds: List[String],
                         wordNetSenseNumber: Option[Int]
                     )
