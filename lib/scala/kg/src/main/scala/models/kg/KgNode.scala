package models.kg

final case class KgNode(
                       id: String,
                       labels: List[String],
                       pos: Option[String],
                       sources: List[String],
                       pageRank: Option[Double]
                     )
