/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgHomePageQuery
// ====================================================

export interface KgHomePageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgHomePageQuery_kgById {
  __typename: "Kg";
  sources: KgHomePageQuery_kgById_sources[];
}

export interface KgHomePageQuery {
  kgById: KgHomePageQuery_kgById;
}

export interface KgHomePageQueryVariables {
  kgId: string;
}
