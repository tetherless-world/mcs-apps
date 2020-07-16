package formats.kg.kgtk

import models.kg.{KgEdge, KgNode}

final case class KgtkEdgeWithNodes(edge: KgEdge, node1: KgNode, node2: KgNode)
