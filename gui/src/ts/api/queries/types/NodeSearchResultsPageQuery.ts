/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeFilters } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: NodeSearchResultsPageQuery
// ====================================================

export interface NodeSearchResultsPageQuery_kg_matchingNodes {
  __typename: "Node";
  aliases: string[] | null;
  datasource: string;
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}

export interface NodeSearchResultsPageQuery_kg {
  __typename: "Kg";
  matchingNodes: NodeSearchResultsPageQuery_kg_matchingNodes[];
  matchingNodesCount: number;
}

export interface NodeSearchResultsPageQuery {
  kg: NodeSearchResultsPageQuery_kg;
}

export interface NodeSearchResultsPageQueryVariables {
  filters: KgNodeFilters;
  kgId: string;
  limit: number;
  offset: number;
  text: string;
  withCount: boolean;
}
