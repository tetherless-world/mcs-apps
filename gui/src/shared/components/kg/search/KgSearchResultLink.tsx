import {KgSource} from "shared/models/kg/source/KgSource";
import * as React from "react";
import {getKgSearchResultLabel} from "shared/models/kg/search/getKgSearchResultLabel";
import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {getPreferredKgNodeLabel} from "shared/models/kg/node/getPreferredKgNodeLabel";
import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";

export const KgSearchResultLink: React.FunctionComponent<{
  allSources: readonly KgSource[];
  result: KgSearchResult;
}> = ({allSources, result}) => {
  switch (result.__typename) {
    case "KgNodeLabelSearchResult": {
      return (
        <Link
          data-cy="node-label-link"
          title={result.nodeLabel}
          to={Hrefs.kg({id: kgId}).nodeLabel({label: result.nodeLabel})}
        >
          <span style={{marginRight: "5px"}}>
            Node label: {result.nodeLabel}
          </span>
        </Link>
      );
    }
    case "KgNodeSearchResult": {
      return (
        <Link
          data-cy="node-link"
          title={result.node.id}
          to={Hrefs.kg({id: kgId}).node({id: result.node.id})}
        >
          Node: {getPreferredKgNodeLabel(result.node)}
        </Link>
      );
    }
    case "KgSourceSearchResult": {
      const source = resolveSourceId({allSources, sourceId: result.sourceId});
      return (
        <Link
          data-cy="source-link"
          title={source.label}
          to={Hrefs.kg({id: kgId}).source({sourceId: source.id})}
        >
          Source: {source.label}
        </Link>
      );
    }
    default:
      return <span>{getKgSearchResultLabel({allSources, result})}</span>;
    // default:
    //   const _exhaustiveCheck: never = value;
    //   _exhaustiveCheck;
  }
};
