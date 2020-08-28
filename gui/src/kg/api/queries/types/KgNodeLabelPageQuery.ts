/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodeLabelPageQuery
// ====================================================

export interface KgNodeLabelPageQuery_kgById_nodesByLabel_nodes {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  pos: string | null;
  pageRank: number;
  sourceIds: string[];
}

export interface KgNodeLabelPageQuery_kgById_nodesByLabel_topSubjectOfEdges_objectNode {
  __typename: "KgNode";
  id: string;
  label: string | null;
  pos: string | null;
}

export interface KgNodeLabelPageQuery_kgById_nodesByLabel_topSubjectOfEdges {
  __typename: "KgEdge";
  object: string;
  objectNode: KgNodeLabelPageQuery_kgById_nodesByLabel_topSubjectOfEdges_objectNode | null;
  predicate: string;
}

export interface KgNodeLabelPageQuery_kgById_nodesByLabel {
  __typename: "KgNodesByLabel";
  nodes: KgNodeLabelPageQuery_kgById_nodesByLabel_nodes[];
  topSubjectOfEdges: KgNodeLabelPageQuery_kgById_nodesByLabel_topSubjectOfEdges[];
}

export interface KgNodeLabelPageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeLabelPageQuery_kgById {
  __typename: "Kg";
  nodesByLabel: KgNodeLabelPageQuery_kgById_nodesByLabel;
  sources: KgNodeLabelPageQuery_kgById_sources[];
}

export interface KgNodeLabelPageQuery {
  kgById: KgNodeLabelPageQuery_kgById;
}

export interface KgNodeLabelPageQueryVariables {
  kgId: string;
  nodeLabel: string;
}
