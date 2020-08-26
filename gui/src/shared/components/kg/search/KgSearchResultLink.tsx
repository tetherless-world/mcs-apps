import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";
import * as React from "react";
import {getKgSearchResultLabel} from "shared/models/kg/search/getKgSearchResultLabel";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgNodeLabelLink} from "shared/components/kg/node/KgNodeLabelLink";

export const KgSearchResultLink: React.FunctionComponent<{
  allSources: readonly KgSource[];
  result: KgSearchResult;
}> = ({allSources, result}) => {
  switch (result.__typename) {
    case "KgNodeLabelSearchResult": {
      return (
        <KgNodeLabelLink
          nodeLabel={result.nodeLabel}
          sources={result.sourceIds.map((sourceId) =>
            resolveSourceId({allSources, sourceId})
          )}
        />
      );
    }
    case "KgNodeSearchResult": {
      return (
        <KgNodeLink
          node={{
            ...result.node,
            sources: result.node.sourceIds.map((sourceId) =>
              resolveSourceId({allSources, sourceId})
            ),
          }}
        />
      );
    }
    default:
      return <span>{getKgSearchResultLabel({allSources, result})}</span>;
    // default:
    //   const _exhaustiveCheck: never = value;
    //   _exhaustiveCheck;
  }
};
