import * as React from "react";
import {TabRoute} from "shared/components/route/TabRoute";
import {Route, Switch} from "react-router-dom";

export const TabRouteSwitch: React.FunctionComponent<{
  tabRoutes: readonly TabRoute[];
}> = ({tabRoutes}) => (
  <Switch>
    {tabRoutes.map((tabRoute) => (
      <Route exact key={tabRoute.path} path={tabRoute.path}>
        {tabRoute.content}
      </Route>
    ))}
  </Switch>
);
