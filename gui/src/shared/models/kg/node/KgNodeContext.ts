export interface KgNodeContextRelatedNodeLabel {
  nodeLabel: string;
  nodes: readonly {
    id: string;
    pos: string | null | undefined;
  }[];
  pageRank: number;
  sourceIds: readonly string[];
}

interface KgNodeContextTopEdge {
  object: string;
  predicate: string;
}

export interface KgNodeContext {
  relatedNodeLabels: readonly KgNodeContextRelatedNodeLabel[];
  topEdges: readonly KgNodeContextTopEdge[];
}
