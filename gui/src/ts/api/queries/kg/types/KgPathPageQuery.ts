/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgPathPageQuery
// ====================================================

export interface KgPathPageQuery_kgById_paths_edges_objectNode {
  __typename: "KgNode";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface KgPathPageQuery_kgById_paths_edges_subjectNode {
  __typename: "KgNode";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface KgPathPageQuery_kgById_paths_edges {
  __typename: "KgEdge";
  datasource: string;
  object: string;
  objectNode: KgPathPageQuery_kgById_paths_edges_objectNode;
  other: string | null;
  predicate: string;
  subject: string;
  subjectNode: KgPathPageQuery_kgById_paths_edges_subjectNode;
  weight: number | null;
}

export interface KgPathPageQuery_kgById_paths {
  __typename: "KgPath";
  datasource: string;
  id: string;
  path: string[];
  edges: KgPathPageQuery_kgById_paths_edges[];
}

export interface KgPathPageQuery_kgById {
  __typename: "Kg";
  paths: KgPathPageQuery_kgById_paths[];
}

export interface KgPathPageQuery {
  kgById: KgPathPageQuery_kgById;
}

export interface KgPathPageQueryVariables {
  kgId: string;
}
