/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageFacetsQuery
// ====================================================

export interface KgNodeSearchResultsPageFacetsQuery_kgById_searchFacets_sourceIds {
  __typename: "StringFacetValue";
  count: number;
  value: string;
}

export interface KgNodeSearchResultsPageFacetsQuery_kgById_searchFacets {
  __typename: "KgSearchFacets";
  sourceIds: KgNodeSearchResultsPageFacetsQuery_kgById_searchFacets_sourceIds[];
}

export interface KgNodeSearchResultsPageFacetsQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageFacetsQuery_kgById {
  __typename: "Kg";
  searchFacets: KgNodeSearchResultsPageFacetsQuery_kgById_searchFacets;
  searchCount: number;
  sources: KgNodeSearchResultsPageFacetsQuery_kgById_sources[];
}

export interface KgNodeSearchResultsPageFacetsQuery {
  kgById: KgNodeSearchResultsPageFacetsQuery_kgById;
}

export interface KgNodeSearchResultsPageFacetsQueryVariables {
  kgId: string;
  query: KgSearchQuery;
  queryText?: string | null;
}
