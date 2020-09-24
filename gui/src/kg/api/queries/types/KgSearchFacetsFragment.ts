/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { KgSearchResultType } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL fragment: KgSearchFacetsFragment
// ====================================================

export interface KgSearchFacetsFragment_sourceIds {
  __typename: "StringFacet";
  count: number;
  value: string;
}

export interface KgSearchFacetsFragment_types {
  __typename: "KgSearchResultTypeFacet";
  count: number;
  value: KgSearchResultType;
}

export interface KgSearchFacetsFragment {
  __typename: "KgSearchFacets";
  sourceIds: KgSearchFacetsFragment_sourceIds[];
  types: KgSearchFacetsFragment_types[];
}
