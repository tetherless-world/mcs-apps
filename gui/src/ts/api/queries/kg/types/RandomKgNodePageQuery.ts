/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RandomKgNodePageQuery
// ====================================================

export interface RandomKgNodePageQuery_kg_randomNode {
  __typename: "KgNode";
  id: string;
}

export interface RandomKgNodePageQuery_kg {
  __typename: "Kg";
  randomNode: RandomKgNodePageQuery_kg_randomNode;
}

export interface RandomKgNodePageQuery {
  kg: RandomKgNodePageQuery_kg;
}

export interface RandomKgNodePageQueryVariables {
  kgId: string;
}
