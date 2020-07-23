/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: KgNodeFieldsFragment
// ====================================================

export interface KgNodeFieldsFragment_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeFieldsFragment {
  __typename: "KgNode";
  aliases: string[] | null;
  sources: KgNodeFieldsFragment_sources[];
  id: string;
  label: string | null;
  other: string | null;
  pos: string | null;
}
