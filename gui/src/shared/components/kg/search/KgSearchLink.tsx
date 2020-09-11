import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {kgId} from "shared/api/kgId";
import {KgSearchQuery} from "kg/api/graphqlGlobalTypes";

export const KgSearchLink: React.FunctionComponent<React.PropsWithChildren<{
  query: KgSearchQuery;
  style?: CSSProperties;
}>> = ({children, query, style}) => (
  <Link
    data-cy="search-link"
    style={style}
    to={Hrefs.kg({id: kgId}).search({
      __typename: "KgSearchVariables",
      query,
    })}
  >
    {children}
  </Link>
);
