package models.kg

final case class KgNode(
                       aliases: Option[List[String]], // No default values so the compiler can check missing fields on construction
                       datasource: String,
                       datasources: List[String],
                       id: String,
                       label: String,
                       other: Option[String],
                       pos: Option[String],
                     )
