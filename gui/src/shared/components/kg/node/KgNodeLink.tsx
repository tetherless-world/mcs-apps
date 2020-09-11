import * as React from "react";
import {Hrefs} from "shared/Hrefs";
import {Link} from "react-router-dom";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgSourcePill} from "../source/KgSourcePill";
import {KgNodePosBadge} from "./KgNodePosBadge";

export const KgNodeLink: React.FunctionComponent<{
  children?: React.ReactNode;
  node: {
    id: string;
    label: string | null;
    pos: string | null;
    sources?: readonly KgSource[];
  };
}> = ({children, node}) => {
  const label = node.label ?? node.id;
  return (
    <Link
      data-cy="node-link"
      title={node.id}
      to={Hrefs.kg({id: kgId}).node({id: node.id})}
    >
      <span style={{marginRight: "5px"}}>
        {node.pos ? (
          <KgNodePosBadge badgeContent={node.pos} color="primary">
            {children ?? label}
          </KgNodePosBadge>
        ) : (
          children ?? label
        )}
      </span>
      {node.sources
        ? node.sources.map((source) => (
            <KgSourcePill key={source.id} source={source} size="small" />
          ))
        : null}
    </Link>
  );
};
