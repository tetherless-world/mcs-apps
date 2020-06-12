/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgNodePageQuery
// ====================================================

export interface KgNodePageQuery_kg_nodeById_subjectOfEdges_objectNode {
  __typename: "KgNode";
  id: string;
  label: string | null;
  pos: string | null;
}

export interface KgNodePageQuery_kg_nodeById_subjectOfEdges {
  __typename: "KgEdge";
  object: string;
  objectNode: KgNodePageQuery_kg_nodeById_subjectOfEdges_objectNode;
  predicate: string;
}

export interface KgNodePageQuery_kg_nodeById {
  __typename: "KgNode";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
  subjectOfEdges: KgNodePageQuery_kg_nodeById_subjectOfEdges[];
}

export interface KgNodePageQuery_kg {
  __typename: "Kg";
  nodeById: KgNodePageQuery_kg_nodeById | null;
}

export interface KgNodePageQuery {
  kg: KgNodePageQuery_kg;
}

export interface KgNodePageQueryVariables {
  kgId: string;
  nodeId: string;
}
