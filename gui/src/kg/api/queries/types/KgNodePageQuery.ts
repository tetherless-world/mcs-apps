/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodePageQuery
// ====================================================

export interface KgNodePageQuery_kgById_node_context_relatedNodeLabels_nodes {
  __typename: "KgNode";
  id: string;
  pos: string | null;
}

export interface KgNodePageQuery_kgById_node_context_relatedNodeLabels {
  __typename: "KgNodeLabel";
  nodeLabel: string;
  nodes: KgNodePageQuery_kgById_node_context_relatedNodeLabels_nodes[];
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
  relatedNodeLabels: KgNodePageQuery_kgById_node_context_relatedNodeLabels[];
  topEdges: KgNodePageQuery_kgById_node_context_topEdges[];
}

export interface KgNodePageQuery_kgById_node {
  __typename: "KgNode";
  context: KgNodePageQuery_kgById_node_context;
  aliases: string[] | null;
  id: string;
  label: string | null;
  pos: string | null;
  pageRank: number;
  sourceIds: string[];
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
