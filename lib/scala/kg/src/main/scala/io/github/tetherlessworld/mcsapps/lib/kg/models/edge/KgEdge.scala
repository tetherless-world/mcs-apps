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
