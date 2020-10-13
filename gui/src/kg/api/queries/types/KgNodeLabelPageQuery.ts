/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodeLabelPageQuery
// ====================================================

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context_predicateLabelMappings {
  __typename: "KgPredicateLabelMapping";
  label: string;
  predicate: string;
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context_relatedNodeLabels {
  __typename: "KgNodeLabel";
  nodeIds: string[];
  nodeLabel: string;
  pageRank: number;
  sourceIds: string[];
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context_topEdges {
  __typename: "KgEdge";
  object: string;
  predicate: string;
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context {
  __typename: "KgNodeLabelContext";
  predicateLabelMappings: KgNodeLabelPageQuery_kgById_nodeLabel_context_predicateLabelMappings[];
  relatedNodeLabels: KgNodeLabelPageQuery_kgById_nodeLabel_context_relatedNodeLabels[];
  topEdges: KgNodeLabelPageQuery_kgById_nodeLabel_context_topEdges[];
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel_nodes {
  __typename: "KgNode";
  id: string;
  labels: string[];
  pageRank: number;
  pos: string | null;
  sourceIds: string[];
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel {
  __typename: "KgNodeLabel";
  context: KgNodeLabelPageQuery_kgById_nodeLabel_context;
  nodeLabel: string;
  nodes: KgNodeLabelPageQuery_kgById_nodeLabel_nodes[];
  pageRank: number;
  sourceIds: string[];
}

export interface KgNodeLabelPageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeLabelPageQuery_kgById {
  __typename: "Kg";
  nodeLabel: KgNodeLabelPageQuery_kgById_nodeLabel | null;
  sources: KgNodeLabelPageQuery_kgById_sources[];
}

export interface KgNodeLabelPageQuery {
  kgById: KgNodeLabelPageQuery_kgById;
}

export interface KgNodeLabelPageQueryVariables {
  kgId: string;
  nodeLabel: string;
}
