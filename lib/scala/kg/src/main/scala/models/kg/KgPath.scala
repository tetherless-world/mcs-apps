package models.kg

/**
 * A path through the graph. The path list is
 * [subject node id, predicate, object node id / subject node id, predicate, ..., object node id]
 */
final case class KgPath(id: String, path: List[String], sources: List[String]) {
  def edges: List[KgEdge] = {
    (0 until (path.length - 1) by 2).map(pathI =>
      KgEdge(
        id = id + "-" + pathI,
        labels = List(),
        `object` = path(pathI + 2),
        origins = List(),
        questions = List(),
        predicate = path(pathI + 1),
        sentences = List(),
        sources = sources,
        subject = path(pathI),
        weight = None
      )
    ).toList
  }
}

object KgPath {
  def apply(edges: List[KgEdge], id: String, sources: List[String]): KgPath =
    KgPath(
      id = id,
      path = List(edges(0).subject) ++ edges.flatMap(edge => List(edge.predicate, edge.`object`)),
      sources = sources
    )
}
