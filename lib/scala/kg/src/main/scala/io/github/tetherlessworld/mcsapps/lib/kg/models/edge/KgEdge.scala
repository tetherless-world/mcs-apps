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
    edges.map(edge => {
      if (edge.labels.length != 1) {
        throw new IllegalArgumentException("multiple edge labels: " + edge.labels)
      }
      (edge.predicate, edge.labels(0))
    }).toMap.toList
      .map({ case (predicate, label) => KgPredicateLabelMapping(label = label, predicate = predicate) })
  }
}
