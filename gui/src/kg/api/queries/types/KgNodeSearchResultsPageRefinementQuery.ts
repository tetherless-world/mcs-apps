/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageRefinementQuery
// ====================================================

export interface KgNodeSearchResultsPageRefinementQuery_kgById_matchingNodes_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageRefinementQuery_kgById_matchingNodes {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgNodeSearchResultsPageRefinementQuery_kgById_matchingNodes_sources[];
  pos: string | null;
}

export interface KgNodeSearchResultsPageRefinementQuery_kgById {
  __typename: "Kg";
  matchingNodes: KgNodeSearchResultsPageRefinementQuery_kgById_matchingNodes[];
  matchingNodesCount: number;
}

export interface KgNodeSearchResultsPageRefinementQuery {
  kgById: KgNodeSearchResultsPageRefinementQuery_kgById;
}

export interface KgNodeSearchResultsPageRefinementQueryVariables {
  kgId: string;
  limit: number;
  offset: number;
  query: KgNodeQuery;
}
