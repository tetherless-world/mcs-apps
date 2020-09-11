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

export interface RandomKgNodePageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface RandomKgNodePageQuery_kgById {
  __typename: "Kg";
  randomNode: RandomKgNodePageQuery_kgById_randomNode;
  sources: RandomKgNodePageQuery_kgById_sources[];
}

export interface RandomKgNodePageQuery {
  kgById: RandomKgNodePageQuery_kgById;
}

export interface RandomKgNodePageQueryVariables {
  kgId: string;
}
