package io.github.tetherlessworld.mcsapps.lib.kg.models.edge

final case class KgEdge(
                         id: String,
                         labels: List[String],
                         `object`: String,
                         predicate: String,
                         sentences: List[String],
                         sourceIds: List[String],
                         subject: String
                       )

object KgEdge {
  def mapPredicatesToLabels(edges: List[KgEdge]): List[KgPredicateLabelMapping] = {
    edges.flatMap(edge => {
      edge.labels.length match {
        case 0 => None
        case 1 => Some((edge.predicate, edge.labels(0)))
        case _ => throw new IllegalArgumentException("multiple edge labels: " + edge.labels)
      }
    }).toMap.toList
      .map({ case (predicate, label) => KgPredicateLabelMapping(label = label, predicate = predicate) })
  }
}
