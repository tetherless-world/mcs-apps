package io.github.tetherlessworld.mcsapps.lib.kg.models.edge

/**
 * Simple data class for a predicate -> label mapping, since GraphQL doesn't support Map.
 * Having a case class is nicer than using a tuple.
 */
final case class KgPredicateLabelMapping(label: String, predicate: String)
