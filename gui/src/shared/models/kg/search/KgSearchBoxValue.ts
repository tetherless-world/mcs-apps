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
        label: string | null;
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
        label: string | null;
      };
    }
  | {
      __typename: "KgSourceSearchResult";
      sourceId: string;
    }
  | {__typename: "text"; filters?: KgSearchFilters; text: string}
  | null;
