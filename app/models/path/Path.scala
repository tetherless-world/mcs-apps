package models.path

/**
 * A path through the graph. The path list is
 * [subject node id, predicate, object node id / subject node id, predicate, ..., object node id]
 */
final case class Path(datasource: String, id: String, path: List[String])
