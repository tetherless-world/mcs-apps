/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: KgSearchFacetsFragment
// ====================================================

export interface KgSearchFacetsFragment_sourceIds {
  __typename: "StringFacetValue";
  count: number;
  value: string;
}

export interface KgSearchFacetsFragment {
  __typename: "KgSearchFacets";
  sourceIds: KgSearchFacetsFragment_sourceIds[];
}
