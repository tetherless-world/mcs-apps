import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";
import * as React from "react";
import {getKgSearchResultLabel} from "shared/models/kg/search/getKgSearchResultLabel";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgNodeLabelLink} from "shared/components/kg/node/KgNodeLabelLink";

export const KgSearchResultLink: React.FunctionComponent<{
  allSources: readonly KgSource[];
  includeSources?: boolean;
  result: KgSearchResult;
}> = ({allSources, includeSources, result}) => {
  switch (result.__typename) {
    case "KgNodeLabelSearchResult": {
      return (
        <span>
          Node label:&nbsp;
          <KgNodeLabelLink
            nodeLabel={result.nodeLabel}
            sources={
              includeSources
                ? result.sourceIds.map((sourceId) =>
                    resolveSourceId({allSources, sourceId})
                  )
                : undefined
            }
          />
        </span>
      );
    }
    case "KgNodeSearchResult": {
      return (
        <span>
          Node:&nbsp;
          <KgNodeLink
            node={{
              ...result.node,
              sources: includeSources
                ? result.node.sourceIds.map((sourceId) =>
                    resolveSourceId({allSources, sourceId})
                  )
                : undefined,
            }}
          />
        </span>
      );
    }
    default:
      return <span>{getKgSearchResultLabel({allSources, result})}</span>;
    // default:
    //   const _exhaustiveCheck: never = value;
    //   _exhaustiveCheck;
  }
};
