/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodeLabelPageQuery
// ====================================================

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context_relatedNodeLabels_nodes {
  __typename: "KgNode";
  id: string;
  labels: string[];
  pos: string | null;
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context_relatedNodeLabels {
  __typename: "KgNodeLabel";
  nodeLabel: string;
  nodes: KgNodeLabelPageQuery_kgById_nodeLabel_context_relatedNodeLabels_nodes[];
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context_topEdges {
  __typename: "KgEdge";
  object: string;
  predicate: string;
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel_context {
  __typename: "KgNodeLabelContext";
  relatedNodeLabels: KgNodeLabelPageQuery_kgById_nodeLabel_context_relatedNodeLabels[];
  topEdges: KgNodeLabelPageQuery_kgById_nodeLabel_context_topEdges[];
}

export interface KgNodeLabelPageQuery_kgById_nodeLabel {
  __typename: "KgNodeLabel";
  context: KgNodeLabelPageQuery_kgById_nodeLabel_context | null;
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
