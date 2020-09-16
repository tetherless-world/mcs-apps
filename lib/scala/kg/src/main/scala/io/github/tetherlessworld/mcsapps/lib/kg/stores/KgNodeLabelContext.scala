package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgNodeLabel}

final case class KgNodeLabelContext(relatedNodeLabels: List[KgNodeLabel], topEdges: List[KgEdge])
