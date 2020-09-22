package io.github.tetherlessworld.mcsapps.lib.kg.models.node

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgEdge

/**
 * Node context data structure for the node page.
 *
 * @param relatedNodeLabels related node labels, should contain all subject/object's of topEdges
 * @param topEdges          top edges connected to this node (as subject or object), sorted by PageRank descending
 */
final case class KgNodeContext(relatedNodeLabels: List[KgNodeLabel], topEdges: List[KgEdge])
