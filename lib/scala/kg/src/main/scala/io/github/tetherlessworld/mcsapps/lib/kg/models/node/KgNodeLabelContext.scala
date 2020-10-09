package io.github.tetherlessworld.mcsapps.lib.kg.models.node

import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.{KgEdge, KgPredicateLabelMapping}

/**
 * Node label context data structure for the node label page.
 *
 * @param predicateLabelMappings     mapping of predicate -> edge label, which assumes that every unique predicate corresponds to a single label
 * @param relatedNodeLabels related node labels, should contain all subject/object's of topEdges
 * @param topEdges          top edges connected to this node label (as subject or object), sorted by PageRank descending
 */
final case class KgNodeLabelContext(
                                     predicateLabelMappings: List[KgPredicateLabelMapping],
                                     relatedNodeLabels: List[KgNodeLabel],
                                     topEdges: List[KgEdge]
                                   )

object KgNodeLabelContext {
  def apply(relatedNodeLabels: List[KgNodeLabel], topEdges: List[KgEdge]): KgNodeLabelContext =
    KgNodeLabelContext(
      predicateLabelMappings = KgEdge.mapPredicatesToLabels(topEdges),
      relatedNodeLabels = relatedNodeLabels,
      topEdges = topEdges
    )
}
