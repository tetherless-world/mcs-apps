package io.github.tetherlessworld.mcsapps.lib.kg.models.node

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgEdge

/**
 * Node label context data structure for the node label page.
 *
 * @param relatedNodeLabels related node labels, should contain all subject/object's of topEdges
 * @param topEdges          top edges connected to this node label (as subject or object), sorted by PageRank descending
 */
final case class KgNodeLabelContext(relatedNodeLabels: List[KgNodeLabel], topEdges: List[KgEdge])
