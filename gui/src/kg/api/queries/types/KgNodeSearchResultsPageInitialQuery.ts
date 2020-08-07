/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageInitialQuery
// ====================================================

export interface KgNodeSearchResultsPageInitialQuery_kgById_matchingNodeFacets_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageInitialQuery_kgById_matchingNodeFacets {
  __typename: "KgNodeFacets";
  sources: KgNodeSearchResultsPageInitialQuery_kgById_matchingNodeFacets_sources[];
}

export interface KgNodeSearchResultsPageInitialQuery_kgById_matchingNodes_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageInitialQuery_kgById_matchingNodes {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgNodeSearchResultsPageInitialQuery_kgById_matchingNodes_sources[];
  pos: string | null;
}

export interface KgNodeSearchResultsPageInitialQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageInitialQuery_kgById {
  __typename: "Kg";
  matchingNodeFacets: KgNodeSearchResultsPageInitialQuery_kgById_matchingNodeFacets;
  matchingNodes: KgNodeSearchResultsPageInitialQuery_kgById_matchingNodes[];
  matchingNodesCount: number;
  sources: KgNodeSearchResultsPageInitialQuery_kgById_sources[];
}

export interface KgNodeSearchResultsPageInitialQuery {
  kgById: KgNodeSearchResultsPageInitialQuery_kgById;
}

export interface KgNodeSearchResultsPageInitialQueryVariables {
  kgId: string;
  limit: number;
  offset: number;
  query: KgNodeQuery;
  queryText?: string | null;
}
