package stores

final case class StringFacetFilter(exclude: Option[List[String]] = None, include: Option[List[String]] = None)
