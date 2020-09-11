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
        <KgNodeLabelLink
          nodeLabel={result.nodeLabel}
          sources={
            includeSources
              ? result.sourceIds.map((sourceId) =>
                  resolveSourceId({allSources, sourceId})
                )
              : undefined
          }
        >
          Node label: {result.nodeLabel}
        </KgNodeLabelLink>
      );
    }
    case "KgNodeSearchResult": {
      return (
        <KgNodeLink
          node={{
            ...result.node,
            sources: includeSources
              ? result.node.sourceIds.map((sourceId) =>
                  resolveSourceId({allSources, sourceId})
                )
              : undefined,
          }}
        >
          Node: {result.node.label ?? result.node.id}
        </KgNodeLink>
      );
    }
    default:
      return <span>{getKgSearchResultLabel({allSources, result})}</span>;
    // default:
    //   const _exhaustiveCheck: never = value;
    //   _exhaustiveCheck;
  }
};
