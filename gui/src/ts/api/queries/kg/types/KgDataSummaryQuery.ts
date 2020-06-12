/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgDataSummaryQuery
// ====================================================

export interface KgDataSummaryQuery_kg {
  __typename: "Kg";
  datasources: string[];
  totalNodesCount: number;
  totalEdgesCount: number;
}

export interface KgDataSummaryQuery {
  kg: KgDataSummaryQuery_kg;
}

export interface KgDataSummaryQueryVariables {
  kgId: string;
}
