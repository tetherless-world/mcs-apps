/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RandomKgNodePageQuery
// ====================================================

export interface RandomKgNodePageQuery_kgById_randomNode {
  __typename: "KgNode";
  id: string;
}

export interface RandomKgNodePageQuery_kgById {
  __typename: "Kg";
  randomNode: RandomKgNodePageQuery_kgById_randomNode;
}

export interface RandomKgNodePageQuery {
  kgById: RandomKgNodePageQuery_kgById;
}

export interface RandomKgNodePageQueryVariables {
  kgId: string;
}
