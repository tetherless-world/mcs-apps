package models.kg

final case class KgNode(
                         id: String,
                         labels: List[String],
                         pageRank: Option[Double],
                         pos: Option[String],
                         sourceIds: List[String]
                     )