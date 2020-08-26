/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchQuery, KgSearchSort } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageResultsQuery
// ====================================================

export interface KgNodeSearchResultsPageResultsQuery_kgById_search_KgEdgeSearchResult {
  __typename: "KgEdgeSearchResult" | "KgEdgeLabelSearchResult" | "KgSourceSearchResult";
}

export interface KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeLabelSearchResult {
  __typename: "KgNodeLabelSearchResult";
  nodeLabel: string;
}

export interface KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult_node_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult_node {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult_node_sources[];
  pos: string | null;
  pageRank: number;
}

export interface KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult {
  __typename: "KgNodeSearchResult";
  node: KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult_node;
}

export type KgNodeSearchResultsPageResultsQuery_kgById_search = KgNodeSearchResultsPageResultsQuery_kgById_search_KgEdgeSearchResult | KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeLabelSearchResult | KgNodeSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult;

export interface KgNodeSearchResultsPageResultsQuery_kgById {
  __typename: "Kg";
  search: KgNodeSearchResultsPageResultsQuery_kgById_search[];
}

export interface KgNodeSearchResultsPageResultsQuery {
  kgById: KgNodeSearchResultsPageResultsQuery_kgById;
}

export interface KgNodeSearchResultsPageResultsQueryVariables {
  kgId: string;
  limit: number;
  offset: number;
  query: KgSearchQuery;
  sorts?: KgSearchSort[] | null;
}
