/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgNodeQuery } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: KgNodeSearchBoxQuery
// ====================================================

export interface KgNodeSearchBoxQuery_kgById_matchingNodes_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchBoxQuery_kgById_matchingNodes {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgNodeSearchBoxQuery_kgById_matchingNodes_sources[];
  pos: string | null;
}

export interface KgNodeSearchBoxQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeSearchBoxQuery_kgById {
  __typename: "Kg";
  matchingNodes: KgNodeSearchBoxQuery_kgById_matchingNodes[];
  sources: KgNodeSearchBoxQuery_kgById_sources[];
}

export interface KgNodeSearchBoxQuery {
  kgById: KgNodeSearchBoxQuery_kgById;
}

export interface KgNodeSearchBoxQueryVariables {
  kgId: string;
  query: KgNodeQuery;
}
