/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RandomNodePageQuery
// ====================================================

export interface RandomNodePageQuery_kg_randomNode {
  __typename: "Node";
  id: string;
}

export interface RandomNodePageQuery_kg {
  __typename: "Kg";
  randomNode: RandomNodePageQuery_kg_randomNode;
}

export interface RandomNodePageQuery {
  kg: RandomNodePageQuery_kg;
}

export interface RandomNodePageQueryVariables {
  kgId: string;
}
