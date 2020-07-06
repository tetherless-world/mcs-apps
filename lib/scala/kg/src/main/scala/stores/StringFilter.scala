package stores

final case class StringFilter(exclude: Option[List[String]] = None, include: Option[List[String]] = None)
