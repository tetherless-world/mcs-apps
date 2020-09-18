export interface KgNodeContextRelatedNodeLabel {
  nodeIds: readonly string[];
  nodeLabel: string;
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
