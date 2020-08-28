import * as React from "react";
import {TabRoute} from "shared/components/route/TabRoute";
import {Tab, Tabs} from "@material-ui/core";
import {Link, useLocation} from "react-router-dom";

export const TabRouteTabs: React.FunctionComponent<{
  tabRoutes: readonly TabRoute[];
}> = ({tabRoutes}) => {
  const location = useLocation();

  return (
    <Tabs value={location.pathname}>
      {Object.values(tabRoutes).map((tabRoute) => (
        <Tab
          component={Link}
          value={tabRoute.url}
          to={tabRoute.url}
          key={tabRoute.url}
          label={tabRoute.label}
          data-cy={`${tabRoute.dataCy}`}
        />
      ))}
    </Tabs>
  );
};
