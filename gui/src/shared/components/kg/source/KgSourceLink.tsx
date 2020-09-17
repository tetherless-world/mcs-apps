import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";

export const KgSourceLink: React.FunctionComponent<{
  source: KgSource;
  style?: CSSProperties;
}> = ({source, style}) => (
  <Link
    data-cy="source-link"
    style={style}
    to={Hrefs.kg({id: kgId}).source({sourceId: source.id})}
  >
    {source.label}
  </Link>
);
