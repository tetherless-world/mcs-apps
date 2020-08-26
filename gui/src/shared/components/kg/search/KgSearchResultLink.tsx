import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";
import * as React from "react";
import {getKgSearchResultLabel} from "shared/models/kg/search/getKgSearchResultLabel";

export const KgSearchResultLink: React.FunctionComponent<{
  result: KgSearchResult;
  sources: readonly KgSource[];
}> = ({result, sources}) => {
  switch (result.__typename) {
    case "KgNodeSearchResult": {
      const node = result.node;
      const nodeSources: KgSource[] = [];
      for (const sourceId of node.sourceIds) {
        const source = sources.find((source) => source.id === sourceId);
        nodeSources.push(source ?? {id: sourceId, label: sourceId});
      }
      return <KgNodeLink node={node} sources={nodeSources} />;
    }
    default:
      return <span>{getKgSearchResultLabel({result, sources})}</span>;
    // default:
    //   const _exhaustiveCheck: never = value;
    //   _exhaustiveCheck;
  }
};
