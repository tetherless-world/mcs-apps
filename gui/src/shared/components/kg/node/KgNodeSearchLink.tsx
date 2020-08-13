import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {kgId} from "shared/api/kgId";
import {KgNodeQuery} from "kg/api/graphqlGlobalTypes";

export const KgNodeSearchLink: React.FunctionComponent<React.PropsWithChildren<{
  query: KgNodeQuery;
  style?: CSSProperties;
}>> = ({children, query, style}) => (
  <Link
    data-cy="search-link"
    style={style}
    to={Hrefs.kg({id: kgId}).nodeSearch({
      __typename: "KgNodeSearchVariables",
      query,
    })}
  >
    {children}
  </Link>
);
