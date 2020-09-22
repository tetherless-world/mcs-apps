package io.github.tetherlessworld.mcsapps.lib.kg.models.search

import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.KgNode

sealed trait KgSearchResult

final case class KgEdgeSearchResult(edge: KgEdge) extends KgSearchResult

final case class KgEdgeLabelSearchResult(edgeLabel: String, sourceIds: List[String]) extends KgSearchResult

final case class KgNodeLabelSearchResult(nodeLabel: String, sourceIds: List[String]) extends KgSearchResult

final case class KgNodeSearchResult(node: KgNode) extends KgSearchResult

final case class KgSourceSearchResult(sourceId: String) extends KgSearchResult
