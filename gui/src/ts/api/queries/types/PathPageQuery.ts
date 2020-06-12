/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PathPageQuery
// ====================================================

export interface PathPageQuery_kg_paths_edges_objectNode {
  __typename: "Node";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface PathPageQuery_kg_paths_edges_subjectNode {
  __typename: "Node";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface PathPageQuery_kg_paths_edges {
  __typename: "KgEdge";
  datasource: string;
  object: string;
  objectNode: PathPageQuery_kg_paths_edges_objectNode;
  other: string | null;
  predicate: string;
  subject: string;
  subjectNode: PathPageQuery_kg_paths_edges_subjectNode;
  weight: number | null;
}

export interface PathPageQuery_kg_paths {
  __typename: "KgPath";
  datasource: string;
  id: string;
  path: string[];
  edges: PathPageQuery_kg_paths_edges[];
}

export interface PathPageQuery_kg {
  __typename: "Kg";
  paths: PathPageQuery_kg_paths[];
}

export interface PathPageQuery {
  kg: PathPageQuery_kg;
}

export interface PathPageQueryVariables {
  kgId: string;
}
