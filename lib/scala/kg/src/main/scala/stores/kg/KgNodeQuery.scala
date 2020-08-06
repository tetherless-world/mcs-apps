package stores.kg

final case class KgNodeQuery(filters: Option[KgNodeFilters], text: Option[String])
