/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: KgNodeFragment
// ====================================================

export interface KgNodeFragment_sources {
  __typename: "KgSource";
  id: string;
  label: string;
}

export interface KgNodeFragment {
  __typename: "KgNode";
  aliases: string[] | null;
  id: string;
  label: string | null;
  sources: KgNodeFragment_sources[];
  pos: string | null;
  pageRank: number;
}
