import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSource} from "shared/models/kg/source/KgSource";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";

export const getKgSearchResultLabel = (kwds: {
  allSources: readonly KgSource[];
  result: KgSearchResult;
}): string => {
  const {allSources, result} = kwds;
  switch (result.__typename) {
    case "KgEdgeLabelSearchResult":
      return result.edgeLabel;
    case "KgEdgeSearchResult":
      return result.edge.labels.length > 0
        ? result.edge.labels[0]
        : result.edge.id;
    case "KgNodeLabelSearchResult":
      return result.nodeLabel;
    case "KgNodeSearchResult":
      return result.node.labels.length > 0
        ? result.node.labels[0]
        : result.node.id;
    case "KgSourceSearchResult":
      return resolveSourceId({allSources, sourceId: result.sourceId}).label;
    default:
      throw new EvalError();
    // const _exhaustiveCheck: never = value;
    // _exhaustiveCheck;
  }
};
