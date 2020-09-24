/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum KgSearchResultType {
  Edge = "Edge",
  EdgeLabel = "EdgeLabel",
  Node = "Node",
  NodeLabel = "NodeLabel",
  Source = "Source",
}

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
  sourceIds?: StringFilter | null;
  types?: KgSearchResultTypeFilter | null;
}

export interface KgSearchQuery {
  filters?: KgSearchFilters | null;
  text?: string | null;
}

export interface KgSearchResultTypeFilter {
  exclude?: KgSearchResultType[] | null;
  include?: KgSearchResultType[] | null;
}

export interface KgSearchSort {
  field: KgSearchSortField;
  direction: SortDirection;
}

export interface StringFilter {
  exclude?: string[] | null;
  include?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
