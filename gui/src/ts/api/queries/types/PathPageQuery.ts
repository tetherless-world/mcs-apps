/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PathPageQuery
// ====================================================

export interface PathPageQuery_paths_edges_objectNode {
  __typename: "Node";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface PathPageQuery_paths_edges_subjectNode {
  __typename: "Node";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface PathPageQuery_paths_edges {
  __typename: "Edge";
  datasource: string;
  object: string;
  objectNode: PathPageQuery_paths_edges_objectNode;
  other: string | null;
  predicate: string;
  subject: string;
  subjectNode: PathPageQuery_paths_edges_subjectNode;
  weight: number | null;
}

export interface PathPageQuery_paths {
  __typename: "Path";
  datasource: string;
  id: string;
  path: string[];
  edges: PathPageQuery_paths_edges[];
}

export interface PathPageQuery {
  paths: PathPageQuery_paths[];
}
