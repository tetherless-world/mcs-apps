/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgSearchBoxAutocompleteQuery
// ====================================================

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeSearchResult {
  __typename: "KgEdgeSearchResult" | "KgEdgeLabelSearchResult" | "KgSourceSearchResult";
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgNodeLabelSearchResult {
  __typename: "KgNodeLabelSearchResult";
  nodeLabel: string;
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult_node {
  __typename: "KgNode";
  id: string;
  label: string | null;
}

export interface KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult {
  __typename: "KgNodeSearchResult";
  node: KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult_node;
}

export type KgSearchBoxAutocompleteQuery_kgById_search = KgSearchBoxAutocompleteQuery_kgById_search_KgEdgeSearchResult | KgSearchBoxAutocompleteQuery_kgById_search_KgNodeLabelSearchResult | KgSearchBoxAutocompleteQuery_kgById_search_KgNodeSearchResult;

export interface KgSearchBoxAutocompleteQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgSearchBoxAutocompleteQuery_kgById {
  __typename: "Kg";
  search: KgSearchBoxAutocompleteQuery_kgById_search[];
  sources: KgSearchBoxAutocompleteQuery_kgById_sources[];
}

export interface KgSearchBoxAutocompleteQuery {
  kgById: KgSearchBoxAutocompleteQuery_kgById;
}

export interface KgSearchBoxAutocompleteQueryVariables {
  kgId: string;
  query: KgSearchQuery;
}
