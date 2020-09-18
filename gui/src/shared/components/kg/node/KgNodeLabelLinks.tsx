import * as React from "react";
import {Hrefs} from "shared/Hrefs";
import {Link} from "react-router-dom";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgSourcePill} from "../source/KgSourcePill";

export const KgNodeLabelLinks: React.FunctionComponent<{
  nodeLabel: string;
  sources: readonly KgSource[];
}> = ({nodeLabel, sources}) => {
  return (
    <span>
      <Link
        data-cy="node-label-link"
        title={nodeLabel}
        to={Hrefs.kg({id: kgId}).nodeLabel({label: nodeLabel})}
      >
        <span style={{marginRight: "5px"}}>{nodeLabel}</span>
      </Link>
      {sources.map((source) => (
        <KgSourcePill key={source.id} source={source} size="small" />
      ))}
    </span>
  );
};
