package models.kg

final case class KgEdge(
                      id: String,
                      labels: List[String],
                      `object`: String,
                      origins: List[String],
                      questions: List[String],
                      relation: String,
                      sentences: List[String],
                      sources: List[String],
                      subject: String,
                      weight: Option[Double]
                     )
