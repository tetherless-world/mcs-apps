/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgDataSummaryQuery
// ====================================================

export interface KgDataSummaryQuery_kgById {
  __typename: "Kg";
  datasources: string[];
  totalNodesCount: number;
  totalEdgesCount: number;
}

export interface KgDataSummaryQuery {
  kgById: KgDataSummaryQuery_kgById;
}

export interface KgDataSummaryQueryVariables {
  kgId: string;
}
