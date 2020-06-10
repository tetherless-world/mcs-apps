import * as React from "react";
import {Hrefs} from "../../Hrefs";
import {Link} from "react-router-dom";

export const NodeLink: React.FunctionComponent<{
  node: {id: string; label: string | null; pos: string | null};
}> = ({node}) => {
  return (
    <Link to={Hrefs.node(node.id)}>
      {(node.label ? node.label : node.id) +
        (node.pos ? " (" + node.pos + ")" : "")}
    </Link>
  );
};
