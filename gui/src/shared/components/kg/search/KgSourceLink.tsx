import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {kgId} from "shared/api/kgId";

export const KgSourceLink: React.FunctionComponent<{
  source: string | string[];
  style?: CSSProperties;
}> = ({source, style}) => (
  <Link
    data-cy="datasource-link"
    style={style}
    to={Hrefs.kg({id: kgId}).nodeSearch({
      filters: {
        sources: {include: typeof source === "string" ? [source] : source},
      },
      __typename: "KgNodeSearchVariables",
    })}
  >
    {source}
  </Link>
);
