/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: KgSearchResultFragment
// ====================================================

export interface KgSearchResultFragment_KgEdgeLabelSearchResult {
  __typename: "KgEdgeLabelSearchResult";
  edgeLabel: string;
  sourceIds: string[];
}

export interface KgSearchResultFragment_KgEdgeSearchResult_edge {
  __typename: "KgEdge";
  id: string;
  labels: string[];
  sourceIds: string[];
}

export interface KgSearchResultFragment_KgEdgeSearchResult {
  __typename: "KgEdgeSearchResult";
  edge: KgSearchResultFragment_KgEdgeSearchResult_edge;
}

export interface KgSearchResultFragment_KgNodeLabelSearchResult {
  __typename: "KgNodeLabelSearchResult";
  nodeLabel: string;
  sourceIds: string[];
}

export interface KgSearchResultFragment_KgNodeSearchResult_node {
  __typename: "KgNode";
  id: string;
  labels: string[];
  pos: string | null;
  sourceIds: string[];
}

export interface KgSearchResultFragment_KgNodeSearchResult {
  __typename: "KgNodeSearchResult";
  node: KgSearchResultFragment_KgNodeSearchResult_node;
}

export interface KgSearchResultFragment_KgSourceSearchResult {
  __typename: "KgSourceSearchResult";
  sourceId: string;
}

export type KgSearchResultFragment = KgSearchResultFragment_KgEdgeLabelSearchResult | KgSearchResultFragment_KgEdgeSearchResult | KgSearchResultFragment_KgNodeLabelSearchResult | KgSearchResultFragment_KgNodeSearchResult | KgSearchResultFragment_KgSourceSearchResult;
