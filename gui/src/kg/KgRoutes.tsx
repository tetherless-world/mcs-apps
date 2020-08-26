import {BrowserRouter, Route, Switch} from "react-router-dom";
import {KgSearchResultsPage} from "kg/components/kg/search/KgSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "kg/components/kg/node/KgNodePage";
import {KgNoRoute} from "kg/components/error/KgNoRoute";
import {KgHomePage} from "kg/components/kg/KgHomePage";
import {KgHrefs} from "kg/KgHrefs";
import {RandomKgNodePage} from "kg/components/kg/node/RandomKgNodePage";
import {kgId} from "shared/api/kgId";
import {QueryParamProvider} from "use-query-params";

export const KgRoutes: React.FunctionComponent = () => (
  <BrowserRouter>
    <QueryParamProvider ReactRouterRoute={Route}>
      <Switch>
        <Route exact path={KgHrefs.home} component={KgHomePage} />

        <Route
          path={KgHrefs.kg({id: kgId}).node({id: ":nodeId", idEncoded: true})}
          component={KgNodePage}
        />
        <Route
          path={KgHrefs.kg({id: kgId}).nodeLabel({
            label: ":nodeLabel",
            labelEncoded: true,
          })}
          component={KgNodePage}
        />
        <Route
          exact
          path={KgHrefs.kg({id: kgId}).randomNode}
          component={RandomKgNodePage}
        />
        <Route
          exact
          path={KgHrefs.kg({id: kgId}).search()}
          component={KgSearchResultsPage}
        />

        <Route component={KgNoRoute} />
      </Switch>
    </QueryParamProvider>
  </BrowserRouter>
);
