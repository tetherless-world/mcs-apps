/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodePageQuery
// ====================================================

export interface KgNodePageQuery_kgById_node_context_predicateLabelMappings {
  __typename: "KgPredicateLabelMapping";
  label: string;
  predicate: string;
}

export interface KgNodePageQuery_kgById_node_context_relatedNodeLabels {
  __typename: "KgNodeLabel";
  nodeIds: string[];
  nodeLabel: string;
  pageRank: number;
  sourceIds: string[];
}

export interface KgNodePageQuery_kgById_node_context_topEdges {
  __typename: "KgEdge";
  object: string;
  predicate: string;
}

export interface KgNodePageQuery_kgById_node_context {
  __typename: "KgNodeContext";
  predicateLabelMappings: KgNodePageQuery_kgById_node_context_predicateLabelMappings[];
  relatedNodeLabels: KgNodePageQuery_kgById_node_context_relatedNodeLabels[];
  topEdges: KgNodePageQuery_kgById_node_context_topEdges[];
}

export interface KgNodePageQuery_kgById_node {
  __typename: "KgNode";
  context: KgNodePageQuery_kgById_node_context;
  id: string;
  labels: string[];
  pageRank: number;
  pos: string | null;
  sourceIds: string[];
  wordNetSenseNumber: number | null;
}

export interface KgNodePageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodePageQuery_kgById {
  __typename: "Kg";
  node: KgNodePageQuery_kgById_node | null;
  sources: KgNodePageQuery_kgById_sources[];
}

export interface KgNodePageQuery {
  kgById: KgNodePageQuery_kgById;
}

export interface KgNodePageQueryVariables {
  kgId: string;
  nodeId: string;
}
