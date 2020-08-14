/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeQuery, KgNodeSort } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPageNodesQuery
// ====================================================

export interface KgNodeSearchResultsPageNodesQuery_kgById_matchingNodes_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageNodesQuery_kgById_matchingNodes {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgNodeSearchResultsPageNodesQuery_kgById_matchingNodes_sources[];
  pos: string | null;
  pageRank: number;
}

export interface KgNodeSearchResultsPageNodesQuery_kgById {
  __typename: "Kg";
  matchingNodes: KgNodeSearchResultsPageNodesQuery_kgById_matchingNodes[];
}

export interface KgNodeSearchResultsPageNodesQuery {
  kgById: KgNodeSearchResultsPageNodesQuery_kgById;
}

export interface KgNodeSearchResultsPageNodesQueryVariables {
  kgId: string;
  limit: number;
  offset: number;
  query: KgNodeQuery;
  sorts?: KgNodeSort[] | null;
}
