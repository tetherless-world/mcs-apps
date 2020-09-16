package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNodeLabel}

final case class KgNodeContext(relatedNodeLabels: List[KgNodeLabel], topEdges: List[KgEdge])
