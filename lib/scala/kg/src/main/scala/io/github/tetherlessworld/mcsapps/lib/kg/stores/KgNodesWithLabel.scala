package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgNode

final case class KgNodesWithLabel(label: String, nodes: List[KgNode])
