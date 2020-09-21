/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchQuery, KgSearchSort } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgSearchResultsPageResultsQuery
// ====================================================

export interface KgSearchResultsPageResultsQuery_kgById_search_KgEdgeLabelSearchResult {
  __typename: "KgEdgeLabelSearchResult";
  edgeLabel: string;
  sourceIds: string[];
}

export interface KgSearchResultsPageResultsQuery_kgById_search_KgEdgeSearchResult_edge {
  __typename: "KgEdge";
  id: string;
  labels: string[];
  sourceIds: string[];
}

export interface KgSearchResultsPageResultsQuery_kgById_search_KgEdgeSearchResult {
  __typename: "KgEdgeSearchResult";
  edge: KgSearchResultsPageResultsQuery_kgById_search_KgEdgeSearchResult_edge;
}

export interface KgSearchResultsPageResultsQuery_kgById_search_KgNodeLabelSearchResult {
  __typename: "KgNodeLabelSearchResult";
  nodeLabel: string;
  sourceIds: string[];
}

export interface KgSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult_node {
  __typename: "KgNode";
  id: string;
  labels: string[];
  pos: string | null;
  sourceIds: string[];
}

export interface KgSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult {
  __typename: "KgNodeSearchResult";
  node: KgSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult_node;
}

export interface KgSearchResultsPageResultsQuery_kgById_search_KgSourceSearchResult {
  __typename: "KgSourceSearchResult";
  sourceId: string;
}

export type KgSearchResultsPageResultsQuery_kgById_search = KgSearchResultsPageResultsQuery_kgById_search_KgEdgeLabelSearchResult | KgSearchResultsPageResultsQuery_kgById_search_KgEdgeSearchResult | KgSearchResultsPageResultsQuery_kgById_search_KgNodeLabelSearchResult | KgSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult | KgSearchResultsPageResultsQuery_kgById_search_KgSourceSearchResult;

export interface KgSearchResultsPageResultsQuery_kgById {
  __typename: "Kg";
  search: KgSearchResultsPageResultsQuery_kgById_search[];
}

export interface KgSearchResultsPageResultsQuery {
  kgById: KgSearchResultsPageResultsQuery_kgById;
}

export interface KgSearchResultsPageResultsQueryVariables {
  kgId: string;
  limit: number;
  offset: number;
  query: KgSearchQuery;
  sorts?: KgSearchSort[] | null;
}
