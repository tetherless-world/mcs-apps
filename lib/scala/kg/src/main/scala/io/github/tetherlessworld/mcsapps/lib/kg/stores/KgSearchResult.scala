package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.{KgEdge, KgNode}

sealed trait KgSearchResult

final case class KgEdgeSearchResult(edge: KgEdge) extends KgSearchResult

final case class KgEdgeLabelSearchResult(edgeLabel: String) extends KgSearchResult

final case class KgNodeLabelSearchResult(nodeLabel: String) extends KgSearchResult

final case class KgNodeSearchResult(node: KgNode) extends KgSearchResult

final case class KgSourceSearchResult(sourceId: String) extends KgSearchResult
