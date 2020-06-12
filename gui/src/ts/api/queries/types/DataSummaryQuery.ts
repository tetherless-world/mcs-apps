/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DataSummaryQuery
// ====================================================

export interface DataSummaryQuery_kg {
  __typename: "Kg";
  datasources: string[];
  totalNodesCount: number;
  totalEdgesCount: number;
}

export interface DataSummaryQuery {
  kg: DataSummaryQuery_kg;
}

export interface DataSummaryQueryVariables {
  kgId: string;
}
