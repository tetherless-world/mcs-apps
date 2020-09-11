import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";

export const getKgSearchResultSourceIds = (kwds: {
  result: KgSearchResult;
}): readonly string[] => {
  const {result} = kwds;
  switch (result.__typename) {
    case "KgEdgeLabelSearchResult":
      return result.sourceIds;
    case "KgEdgeSearchResult":
      return result.edge.sourceIds;
    case "KgNodeLabelSearchResult":
      return result.sourceIds;
    case "KgNodeSearchResult":
      return result.node.sourceIds;
    case "KgSourceSearchResult":
      return [result.sourceId];
    default:
      throw new EvalError();
    // const _exhaustiveCheck: never = value;
    // _exhaustiveCheck;
  }
};
