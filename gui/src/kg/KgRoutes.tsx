import {BrowserRouter, Route, Switch} from "react-router-dom";
import {KgNodeSearchResultsPage} from "kg/components/kg/search/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "kg/components/kg/node/KgNodePage";
import {NoRoute} from "benchmark/components/error/NoRoute";
import {KgHomePage} from "kg/components/kg/KgHomePage";
import {KgHrefs} from "kg/KgHrefs";
import {RandomKgNodePage} from "kg/components/kg/node/RandomKgNodePage";
import {kgId} from "shared/api/kgId";

export const KgRoutes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path={KgHrefs.home} component={KgHomePage} />

      <Route
        exact
        path={KgHrefs.kg({id: kgId}).nodeSearch()}
        component={KgNodeSearchResultsPage}
      />
      <Route
        path={KgHrefs.kg({id: kgId}).node({id: ":nodeId", idEncoded: true})}
        component={KgNodePage}
      />
      <Route
        exact
        path={KgHrefs.kg({id: kgId}).randomNode}
        component={RandomKgNodePage}
      />

      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
