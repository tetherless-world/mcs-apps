/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgHomePageQuery
// ====================================================

export interface KgHomePageQuery_kgById {
  __typename: "Kg";
  datasources: string[];
  totalNodesCount: number;
  totalEdgesCount: number;
}

export interface KgHomePageQuery {
  kgById: KgHomePageQuery_kgById;
}

export interface KgHomePageQueryVariables {
  kgId: string;
}
