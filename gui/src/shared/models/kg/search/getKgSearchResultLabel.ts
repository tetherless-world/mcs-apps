import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSource} from "shared/models/kg/source/KgSource";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {getPreferredKgEdgeLabel} from "shared/models/kg/edge/getPreferredKgEdgeLabel";
import {getPreferredKgNodeLabel} from "shared/models/kg/node/getPreferredKgNodeLabel";

export const getKgSearchResultLabel = (kwds: {
  allSources: readonly KgSource[];
  result: KgSearchResult;
}): string => {
  const {allSources, result} = kwds;
  switch (result.__typename) {
    case "KgEdgeLabelSearchResult":
      return result.edgeLabel;
    case "KgEdgeSearchResult":
      return getPreferredKgEdgeLabel(result.edge);
    case "KgNodeLabelSearchResult":
      return result.nodeLabel;
    case "KgNodeSearchResult":
      return getPreferredKgNodeLabel(result.node);
    case "KgSourceSearchResult":
      return resolveSourceId({allSources, sourceId: result.sourceId}).label;
    default:
      throw new EvalError();
    // const _exhaustiveCheck: never = value;
    // _exhaustiveCheck;
  }
};
