import {Link} from "react-router-dom";
import {Hrefs} from "kg/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {kgId} from "kg/api/kgId";

export const KgDatasourceLink: React.FunctionComponent<{
  datasource: string;
  style?: CSSProperties;
}> = ({datasource, style}) => (
  <Link
    data-cy="datasource-link"
    style={style}
    to={Hrefs.kg({id: kgId}).nodeSearch({
      filters: {datasource: {include: [datasource]}},
      __typename: "KgNodeSearchVariables",
    })}
  >
    {datasource}
  </Link>
);
