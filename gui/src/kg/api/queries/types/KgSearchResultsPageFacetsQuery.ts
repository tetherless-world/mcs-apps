/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgSearchResultsPageFacetsQuery
// ====================================================

export interface KgSearchResultsPageFacetsQuery_kgById_searchFacets_sourceIds {
  __typename: "StringFacetValue";
  count: number;
  value: string;
}

export interface KgSearchResultsPageFacetsQuery_kgById_searchFacets {
  __typename: "KgSearchFacets";
  sourceIds: KgSearchResultsPageFacetsQuery_kgById_searchFacets_sourceIds[];
}

export interface KgSearchResultsPageFacetsQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgSearchResultsPageFacetsQuery_kgById {
  __typename: "Kg";
  searchFacets: KgSearchResultsPageFacetsQuery_kgById_searchFacets;
  searchCount: number;
  sources: KgSearchResultsPageFacetsQuery_kgById_sources[];
}

export interface KgSearchResultsPageFacetsQuery {
  kgById: KgSearchResultsPageFacetsQuery_kgById;
}

export interface KgSearchResultsPageFacetsQueryVariables {
  kgId: string;
  query: KgSearchQuery;
  queryText?: string | null;
}
