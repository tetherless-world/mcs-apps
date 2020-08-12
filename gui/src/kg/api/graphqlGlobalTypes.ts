/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum KgNodeSortableField {
  Id = "Id",
  Labels = "Labels",
  PageRank = "PageRank",
  Sources = "Sources",
}

export enum SortDirection {
  Ascending = "Ascending",
  Descending = "Descending",
}

export interface KgNodeFilters {
  sourceIds?: StringFacetFilter | null;
}

export interface KgNodeQuery {
  filters?: KgNodeFilters | null;
  text?: string | null;
}

export interface KgNodeSort {
  field: KgNodeSortableField;
  direction: SortDirection;
}

export interface StringFacetFilter {
  exclude?: string[] | null;
  include?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
