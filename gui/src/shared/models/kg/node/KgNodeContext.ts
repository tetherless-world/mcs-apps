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

interface KgPredicateLabelMapping {
  label: string;
  predicate: string;
}

export interface KgNodeContext {
  predicateLabelMappings: readonly KgPredicateLabelMapping[];
  relatedNodeLabels: readonly KgNodeContextRelatedNodeLabel[];
  topEdges: readonly KgNodeContextTopEdge[];
}
