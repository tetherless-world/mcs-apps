/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NodePageQuery
// ====================================================

export interface NodePageQuery_kg_nodeById_subjectOfEdges_objectNode {
  __typename: "Node";
  id: string;
  label: string | null;
  pos: string | null;
}

export interface NodePageQuery_kg_nodeById_subjectOfEdges {
  __typename: "KgEdge";
  object: string;
  objectNode: NodePageQuery_kg_nodeById_subjectOfEdges_objectNode;
  predicate: string;
}

export interface NodePageQuery_kg_nodeById {
  __typename: "Node";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
  subjectOfEdges: NodePageQuery_kg_nodeById_subjectOfEdges[];
}

export interface NodePageQuery_kg {
  __typename: "Kg";
  nodeById: NodePageQuery_kg_nodeById | null;
}

export interface NodePageQuery {
  kg: NodePageQuery_kg;
}

export interface NodePageQueryVariables {
  kgId: string;
  nodeId: string;
}
