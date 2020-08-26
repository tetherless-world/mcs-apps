/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodePageQuery
// ====================================================

export interface KgNodePageQuery_kgById_nodeById_topSubjectOfEdges_objectNode {
  __typename: "KgNode";
  id: string;
  label: string | null;
  pos: string | null;
}

export interface KgNodePageQuery_kgById_nodeById_topSubjectOfEdges {
  __typename: "KgEdge";
  object: string;
  objectNode: KgNodePageQuery_kgById_nodeById_topSubjectOfEdges_objectNode | null;
  predicate: string;
}

export interface KgNodePageQuery_kgById_nodeById {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  pos: string | null;
  pageRank: number;
  sourceIds: string[];
  topSubjectOfEdges: KgNodePageQuery_kgById_nodeById_topSubjectOfEdges[];
}

export interface KgNodePageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodePageQuery_kgById {
  __typename: "Kg";
  nodeById: KgNodePageQuery_kgById_nodeById | null;
  sources: KgNodePageQuery_kgById_sources[];
}

export interface KgNodePageQuery {
  kgById: KgNodePageQuery_kgById;
}

export interface KgNodePageQueryVariables {
  kgId: string;
  nodeId: string;
}
