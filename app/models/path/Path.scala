package models.path

import models.cskg.Edge

/**
 * A path through the graph. The path list is
 * [subject node id, predicate, object node id / subject node id, predicate, ..., object node id]
 */
final case class Path(datasource: String, id: String, path: List[String]) {
  def edges: List[Edge] = {
    (0 until (path.length - 1) by 2).map(pathI =>
      Edge(datasource = datasource, `object` = path(pathI + 2), other = None, predicate = path(pathI + 1), subject = path(pathI), weight = None)
    ).toList
  }
}
