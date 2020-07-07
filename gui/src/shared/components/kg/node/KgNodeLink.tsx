import * as React from "react";
import {Hrefs} from "shared/Hrefs";
import {Link} from "react-router-dom";
import {kgId} from "shared/api/kgId";

export const KgNodeLink: React.FunctionComponent<{
  node: {id: string; label: string | null; pos: string | null};
  datasource?: string;
}> = ({node, datasource}) => {
  return (
    <Link data-cy="node-link" to={Hrefs.kg({id: kgId}).node({id: node.id})}>
      {(node.label ? node.label : node.id) +
        (node.pos ? " (" + node.pos + ")" : "") +
        (datasource ? " - " + datasource : "")}
    </Link>
  );
};
