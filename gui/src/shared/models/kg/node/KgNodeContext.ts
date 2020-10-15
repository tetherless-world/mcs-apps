export interface KgNodeContextRelatedNodeLabel {
  nodeIds: readonly string[];
  nodeLabel: string;
  pageRank: number;
}

export interface KgNodeContextTopEdge {
  object: string;
  predicate: string;
  sourceIds: readonly string[];
}

interface KgPredicateLabelMapping {
  label: string;
  predicate: string;
}

export interface KgNodeContext {
  predicateLabelMappings: readonly KgPredicateLabelMapping[];
  relatedNodeLabels: readonly KgNodeContextRelatedNodeLabel[];
  topEdges: readonly KgNodeContextTopEdge[];
}
