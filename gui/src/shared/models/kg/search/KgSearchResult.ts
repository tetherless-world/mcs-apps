export type KgSearchResult =
  | {
      __typename: "KgEdgeLabelSearchResult";
      edgeLabel: string;
      sourceIds: readonly string[];
    }
  | {
      __typename: "KgEdgeSearchResult";
      edge: {
        id: string;
        labels: string[];
        sourceIds: readonly string[];
      };
    }
  | {
      __typename: "KgNodeLabelSearchResult";
      nodeLabel: string;
      sourceIds: readonly string[];
    }
  | {
      __typename: "KgNodeSearchResult";
      node: {
        id: string;
        labels: string[];
        pos: string | null;
        sourceIds: readonly string[];
      };
    }
  | {
      __typename: "KgSourceSearchResult";
      sourceId: string;
    };
