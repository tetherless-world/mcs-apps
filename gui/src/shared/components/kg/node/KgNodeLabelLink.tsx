import * as React from "react";
import {Hrefs} from "shared/Hrefs";
import {Link} from "react-router-dom";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgSourcePill} from "../source/KgSourcePill";

export const KgNodeLabelLink: React.FunctionComponent<{
  children?: React.ReactNode;
  nodeLabel: string;
  sources?: readonly KgSource[];
}> = ({children, nodeLabel, sources}) => {
  return (
    <Link
      data-cy="node-label-link"
      title={nodeLabel}
      to={Hrefs.kg({id: kgId}).nodeLabel({label: nodeLabel})}
    >
      <span style={{marginRight: "5px"}}>{children ?? nodeLabel}</span>
      {sources &&
        sources.map((source) => (
          <KgSourcePill key={source.id} source={source} size="small" />
        ))}
    </Link>
  );
};
