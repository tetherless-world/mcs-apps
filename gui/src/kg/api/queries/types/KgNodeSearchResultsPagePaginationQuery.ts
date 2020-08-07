/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchResultsPagePaginationQuery
// ====================================================

export interface KgNodeSearchResultsPagePaginationQuery_kgById_matchingNodes_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPagePaginationQuery_kgById_matchingNodes {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgNodeSearchResultsPagePaginationQuery_kgById_matchingNodes_sources[];
  pos: string | null;
}

export interface KgNodeSearchResultsPagePaginationQuery_kgById {
  __typename: "Kg";
  matchingNodes: KgNodeSearchResultsPagePaginationQuery_kgById_matchingNodes[];
}

export interface KgNodeSearchResultsPagePaginationQuery {
  kgById: KgNodeSearchResultsPagePaginationQuery_kgById;
}

export interface KgNodeSearchResultsPagePaginationQueryVariables {
  kgId: string;
  limit: number;
  offset: number;
  query: KgNodeQuery;
}
