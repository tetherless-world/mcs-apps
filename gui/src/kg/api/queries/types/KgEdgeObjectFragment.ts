/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: KgEdgeObjectFragment
// ====================================================

export interface KgEdgeObjectFragment_objectNode {
  __typename: "KgNode";
  id: string;
  label: string | null;
  pos: string | null;
}

export interface KgEdgeObjectFragment {
  __typename: "KgEdge";
  object: string;
  objectNode: KgEdgeObjectFragment_objectNode | null;
  predicate: string;
}
