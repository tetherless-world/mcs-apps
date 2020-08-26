import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSource} from "shared/models/kg/source/KgSource";

export const getKgSearchResultLabel = (kwds: {
  allSources: readonly KgSource[];
  result: KgSearchResult;
}): string => {
  const {allSources, result} = kwds;
  switch (result.__typename) {
    case "KgEdgeLabelSearchResult":
      return result.edgeLabel;
    case "KgEdgeSearchResult":
      return result.edge.label ?? result.edge.id;
    case "KgNodeLabelSearchResult":
      return result.nodeLabel;
    case "KgNodeSearchResult":
      return result.node.label ?? result.node.id;
    case "KgSourceSearchResult": {
      const source = allSources.find((source) => source.id === result.sourceId);
      return source ? source.label : result.sourceId;
    }
    default:
      throw new EvalError();
    // const _exhaustiveCheck: never = value;
    // _exhaustiveCheck;
  }
};
