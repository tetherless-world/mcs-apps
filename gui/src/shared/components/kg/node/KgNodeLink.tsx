import * as React from "react";
import {Hrefs} from "shared/Hrefs";
import {Link} from "react-router-dom";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";

export const KgNodeLink: React.FunctionComponent<{
  node: {id: string; label: string | null; pos: string | null};
  sources?: readonly KgSource[];
}> = ({node, sources}) => {
  return (
    <Link
      data-cy="node-link"
      title={node.id}
      to={Hrefs.kg({id: kgId}).node({id: node.id})}
    >
      {(node.label ? node.label : node.id) +
        (node.pos ? " (" + node.pos + ")" : "") +
        (sources && sources.length > 0
          ? " - " + sources.map((source) => source.label).join(" | ")
          : "")}
    </Link>
  );
};
