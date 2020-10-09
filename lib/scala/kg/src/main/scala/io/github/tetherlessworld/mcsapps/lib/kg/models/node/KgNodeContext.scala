package io.github.tetherlessworld.mcsapps.lib.kg.models.node

import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.{KgEdge, KgPredicateLabelMapping}

/**
 * Node context data structure for the node page.
 *
 * @param predicateLabelMappings     mapping of predicate -> edge label, which assumes that every unique predicate corresponds to a single label
 * @param relatedNodeLabels related node labels, should contain all subject/object's of topEdges
 * @param topEdges          top edges connected to this node (as subject or object), sorted by PageRank descending
 */
final case class KgNodeContext(relatedNodeLabels: List[KgNodeLabel], predicateLabelMappings: List[KgPredicateLabelMapping], topEdges: List[KgEdge])

object KgNodeContext {
  def apply(relatedNodeLabels: List[KgNodeLabel], topEdges: List[KgEdge]): KgNodeContext =
    KgNodeContext(
      predicateLabelMappings = KgEdge.mapPredicatesToLabels(topEdges),
      relatedNodeLabels = relatedNodeLabels,
      topEdges = topEdges
    )
}
