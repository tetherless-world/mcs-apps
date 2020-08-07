/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: KgNodeFacetsFragment
// ====================================================

export interface KgNodeFacetsFragment_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeFacetsFragment {
  __typename: "KgNodeFacets";
  sources: KgNodeFacetsFragment_sources[];
}
