package io.github.tetherlessworld.mcsapps.lib.kg.models.kg

final case class KgEdge(
                         id: String,
                         labels: List[String],
                         `object`: String,
                         predicate: String,
                         sentences: List[String],
                         sources: List[String],
                         subject: String
                       )
