import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {kgId} from "shared/api/kgId";
import {KgSearchQuery} from "kg/api/graphqlGlobalTypes";
import {HrefsContext} from "shared/HrefsContext";

export const KgSearchLink: React.FunctionComponent<React.PropsWithChildren<{
  query: KgSearchQuery;
  style?: CSSProperties;
}>> = ({children, query, style}) => {
  const hrefs = React.useContext<Hrefs>(HrefsContext);
  return (
    <Link
      data-cy="search-link"
      style={style}
      to={hrefs.kg({id: kgId}).search({
        __typename: "KgSearchVariables",
        query,
      })}
    >
      {children}
    </Link>
  );
};
