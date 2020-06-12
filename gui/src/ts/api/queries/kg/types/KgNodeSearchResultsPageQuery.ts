/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeFilters } from "./../../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageQuery
// ====================================================

export interface KgNodeSearchResultsPageQuery_kg_matchingNodes {
  __typename: "KgNode";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface KgNodeSearchResultsPageQuery_kg {
  __typename: "Kg";
  matchingNodes: KgNodeSearchResultsPageQuery_kg_matchingNodes[];
  matchingNodesCount: number;
}

export interface KgNodeSearchResultsPageQuery {
  kg: KgNodeSearchResultsPageQuery_kg;
}

export interface KgNodeSearchResultsPageQueryVariables {
  filters: KgNodeFilters;
  kgId: string;
  limit: number;
  offset: number;
  text: string;
  withCount: boolean;
}
