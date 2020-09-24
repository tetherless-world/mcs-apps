/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchQuery, KgSearchResultType } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgSearchResultsPageFacetsQuery
// ====================================================

export interface KgSearchResultsPageFacetsQuery_kgById_searchFacets_sourceIds {
  __typename: "StringFacet";
  count: number;
  value: string;
}

export interface KgSearchResultsPageFacetsQuery_kgById_searchFacets_types {
  __typename: "KgSearchResultTypeFacet";
  count: number;
  value: KgSearchResultType;
}

export interface KgSearchResultsPageFacetsQuery_kgById_searchFacets {
  __typename: "KgSearchFacets";
  sourceIds: KgSearchResultsPageFacetsQuery_kgById_searchFacets_sourceIds[];
  types: KgSearchResultsPageFacetsQuery_kgById_searchFacets_types[];
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
