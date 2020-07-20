/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodePageQuery
// ====================================================

export interface KgNodePageQuery_kgById_nodeById_subjectOfEdges_objectNode {
  __typename: "KgNode";
  id: string;
  label: string | null;
  pos: string | null;
}

export interface KgNodePageQuery_kgById_nodeById_subjectOfEdges {
  __typename: "KgEdge";
  object: string;
  objectNode: KgNodePageQuery_kgById_nodeById_subjectOfEdges_objectNode | null;
  predicate: string;
}

export interface KgNodePageQuery_kgById_nodeById {
  __typename: "KgNode";
  aliases: string[] | null;
  sources: string[];
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
  subjectOfEdges: KgNodePageQuery_kgById_nodeById_subjectOfEdges[];
}

export interface KgNodePageQuery_kgById {
  __typename: "Kg";
  nodeById: KgNodePageQuery_kgById_nodeById | null;
}

export interface KgNodePageQuery {
  kgById: KgNodePageQuery_kgById;
}

export interface KgNodePageQueryVariables {
  kgId: string;
  nodeId: string;
}
