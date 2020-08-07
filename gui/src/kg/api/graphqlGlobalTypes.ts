/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface KgNodeFilters {
  sources?: StringFacetFilter | null;
}

export interface KgNodeQuery {
  filters?: KgNodeFilters | null;
  text?: string | null;
}

export interface StringFacetFilter {
  exclude?: string[] | null;
  include?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
