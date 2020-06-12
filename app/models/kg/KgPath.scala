package models.kg

/**
 * A path through the graph. The path list is
 * [subject node id, predicate, object node id / subject node id, predicate, ..., object node id]
 */
final case class KgPath(datasource: String, id: String, path: List[String]) {
  def edges: List[KgEdge] = {
    (0 until (path.length - 1) by 2).map(pathI =>
      KgEdge(datasource = datasource, `object` = path(pathI + 2), other = None, predicate = path(pathI + 1), subject = path(pathI), weight = None)
    ).toList
  }
}

object KgPath {
  def apply(datasource: String, edges: List[KgEdge], id: String): KgPath =
    KgPath(
      datasource = datasource,
      id = id,
      path = List(edges(0).subject) ++ edges.flatMap(edge => List(edge.predicate, edge.`object`))
    )
}
