/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: KgSearchFormNodeLabelQuery
// ====================================================

export interface KgSearchFormNodeLabelQuery_kgById_nodeLabel {
  __typename: "KgNodeLabel";
  nodeLabel: string;
}

export interface KgSearchFormNodeLabelQuery_kgById {
  __typename: "Kg";
  nodeLabel: KgSearchFormNodeLabelQuery_kgById_nodeLabel | null;
}

export interface KgSearchFormNodeLabelQuery {
  kgById: KgSearchFormNodeLabelQuery_kgById;
}

export interface KgSearchFormNodeLabelQueryVariables {
  kgId: string;
  nodeLabel: string;
}
