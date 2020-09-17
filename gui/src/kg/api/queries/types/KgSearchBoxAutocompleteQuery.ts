/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgSearchBoxAutocompleteQuery
// ====================================================

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeLabelSearchResult {
  __typename: "KgEdgeLabelSearchResult";
  edgeLabel: string;
  sourceIds: string[];
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeSearchResult_edge {
  __typename: "KgEdge";
  id: string;
  label: string | null;
  sourceIds: string[];
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeSearchResult {
  __typename: "KgEdgeSearchResult";
  edge: KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeSearchResult_edge;
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgNodeLabelSearchResult {
  __typename: "KgNodeLabelSearchResult";
  nodeLabel: string;
  sourceIds: string[];
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult_node {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  pos: string | null;
  pageRank: number;
  sourceIds: string[];
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult {
  __typename: "KgNodeSearchResult";
  node: KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult_node;
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgSourceSearchResult {
  __typename: "KgSourceSearchResult";
  sourceId: string;
}

export type KgSearchBoxAutocompleteQuery_kgById_search = KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeLabelSearchResult | KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeSearchResult | KgSearchBoxAutocompleteQuery_kgById_search_KgNodeLabelSearchResult | KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult | KgSearchBoxAutocompleteQuery_kgById_search_KgSourceSearchResult;

export interface KgSearchBoxAutocompleteQuery_kgById {
  __typename: "Kg";
  search: KgSearchBoxAutocompleteQuery_kgById_search[];
}

export interface KgSearchBoxAutocompleteQuery {
  kgById: KgSearchBoxAutocompleteQuery_kgById;
}

export interface KgSearchBoxAutocompleteQueryVariables {
  kgId: string;
  query: KgSearchQuery;
}