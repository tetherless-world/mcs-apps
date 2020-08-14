/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageNodeFacetsQuery
// ====================================================

export interface KgNodeSearchResultsPageNodeFacetsQuery_kgById_matchingNodeFacets_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageNodeFacetsQuery_kgById_matchingNodeFacets {
  __typename: "KgNodeFacets";
  sources: KgNodeSearchResultsPageNodeFacetsQuery_kgById_matchingNodeFacets_sources[];
}

export interface KgNodeSearchResultsPageNodeFacetsQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageNodeFacetsQuery_kgById {
  __typename: "Kg";
  matchingNodeFacets: KgNodeSearchResultsPageNodeFacetsQuery_kgById_matchingNodeFacets;
  matchingNodesCount: number;
  sources: KgNodeSearchResultsPageNodeFacetsQuery_kgById_sources[];
}

export interface KgNodeSearchResultsPageNodeFacetsQuery {
  kgById: KgNodeSearchResultsPageNodeFacetsQuery_kgById;
}

export interface KgNodeSearchResultsPageNodeFacetsQueryVariables {
  kgId: string;
  query: KgNodeQuery;
  queryText?: string | null;
}
