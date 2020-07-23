import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/KgSource";

export const KgSourceLink: React.FunctionComponent<{
  source: KgSource;
  style?: CSSProperties;
}> = ({source, style}) => (
  <Link
    data-cy="datasource-link"
    style={style}
    to={Hrefs.kg({id: kgId}).nodeSearch({
      filters: {
        sources: {include: [source.id]},
      },
      __typename: "KgNodeSearchVariables",
    })}
  >
    {source.label}
  </Link>
);
