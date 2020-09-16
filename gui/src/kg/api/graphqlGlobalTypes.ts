/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum KgSearchSortField {
  Id = "Id",
  Labels = "Labels",
  PageRank = "PageRank",
  Sources = "Sources",
}

export enum SortDirection {
  Ascending = "Ascending",
  Descending = "Descending",
}

export interface KgSearchFilters {
  sourceIds?: StringFacetFilter | null;
}

export interface KgSearchQuery {
  filters?: KgSearchFilters | null;
  text?: string | null;
}

export interface KgSearchSort {
  field: KgSearchSortField;
  direction: SortDirection;
}

export interface StringFacetFilter {
  exclude?: string[] | null;
  include?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
