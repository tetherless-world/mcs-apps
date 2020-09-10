package io.github.tetherlessworld.mcsapps.lib.kg.models.kg

/**
 * A path through the graph. The path list is
 * [subject node id, predicate, object node id / subject node id, predicate, ..., object node id]
 */
final case class KgPath(id: String, path: List[String], sourceIds: List[String]) {
  def edges: List[KgEdge] = {
    (0 until (path.length - 1) by 2).map(pathI =>
      KgEdge(
        id = id + "-" + pathI,
        labels = List(),
        `object` = path(pathI + 2),
        predicate = path(pathI + 1),
        sentences = List(),
        sourceIds = sourceIds,
        subject = path(pathI)
      )
    ).toList
  }
}

object KgPath {
  def apply(edges: List[KgEdge], id: String, sourceIds: List[String]): KgPath =
    KgPath(
      id = id,
      path = List(edges(0).subject) ++ edges.flatMap(edge => List(edge.predicate, edge.`object`)),
      sourceIds = sourceIds
    )
}
