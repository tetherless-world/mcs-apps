import {KgSearchFilters} from "shared/models/kg/search/KgSearchFilters";

export type KgSearchBoxValue =
  | {
      __typename: "KgEdgeLabelSearchResult";
      edgeLabel: string;
    }
  | {
      __typename: "KgEdgeSearchResult";
      edge: {
        id: string;
        labels: readonly string[];
      };
    }
  | {
      __typename: "KgNodeLabelSearchResult";
      nodeLabel: string;
    }
  | {
      __typename: "KgNodeSearchResult";
      node: {
        id: string;
        labels: readonly string[];
      };
    }
  | {
      __typename: "KgSourceSearchResult";
      sourceId: string;
    }
  | {__typename: "text"; filters?: KgSearchFilters; text: string}
  | null;
