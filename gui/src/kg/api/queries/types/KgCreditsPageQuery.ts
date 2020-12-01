/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgCreditsPageQuery
// ====================================================

export interface KgCreditsPageQuery_kgById_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgCreditsPageQuery_kgById {
  __typename: "Kg";
  sources: KgCreditsPageQuery_kgById_sources[];
}

export interface KgCreditsPageQuery {
  kgById: KgCreditsPageQuery_kgById;
}

export interface KgCreditsPageQueryVariables {
  kgId: string;
}
