package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode, KgNodeLabel}

final case class KgNodeContext(node: KgNode, relatedNodeLabels: List[KgNodeLabel], topEdges: List[KgEdge])
