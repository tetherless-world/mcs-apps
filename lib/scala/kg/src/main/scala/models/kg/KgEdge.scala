package models.kg

final case class KgEdge(
                         id: String,
                         labels: List[String],
                         `object`: String,
                         origins: List[String],
                         predicate: String,
                         questions: List[String],
                         sentences: List[String],
                         sources: List[String],
                         subject: String,
                         weight: Option[Double]
                     )
