/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeQuery } from "./../../graphqlGlobalTypes";

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

export interface KgNodeSearchResultsPageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchResultsPageQuery_kgById {
  __typename: "Kg";
  matchingNodes: KgNodeSearchResultsPageQuery_kgById_matchingNodes[];
  matchingNodesCount: number;
  sources: KgNodeSearchResultsPageQuery_kgById_sources[];
}

export interface KgNodeSearchResultsPageQuery {
  kgById: KgNodeSearchResultsPageQuery_kgById;
}

export interface KgNodeSearchResultsPageQueryVariables {
  initialQuery: boolean;
  kgId: string;
  limit: number;
  query: KgNodeQuery;
  offset: number;
}
