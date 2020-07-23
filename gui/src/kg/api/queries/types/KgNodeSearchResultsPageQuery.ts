/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeFilters } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageQuery
// ====================================================

export interface KgNodeSearchResultsPageQuery_kgById_matchingNodes_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageQuery_kgById_matchingNodes {
  __typename: "KgNode";
  aliases: string[] | null;
  sources: KgNodeSearchResultsPageQuery_kgById_matchingNodes_sources[];
  id: string;
  label: string | null;
  pos: string | null;
}

export interface KgNodeSearchResultsPageQuery_kgById {
  __typename: "Kg";
  matchingNodes: KgNodeSearchResultsPageQuery_kgById_matchingNodes[];
  matchingNodesCount: number;
}

export interface KgNodeSearchResultsPageQuery {
  kgById: KgNodeSearchResultsPageQuery_kgById;
}

export interface KgNodeSearchResultsPageQueryVariables {
  filters?: KgNodeFilters | null;
  kgId: string;
  limit: number;
  offset: number;
  text?: string | null;
  withCount: boolean;
}
