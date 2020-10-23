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
import {KgNodeLabelPage} from "kg/components/kg/node/KgNodeLabelPage";

export const KgRoutes: React.FunctionComponent = () => {
  const hrefs = new KgHrefs();
  return (
    <BrowserRouter>
      <QueryParamProvider ReactRouterRoute={Route}>
        <Switch>
          <Route
            exact
            path={hrefs.kg({id: kgId}).home}
            component={KgHomePage}
          />

          <Route
            path={hrefs.kg({id: kgId}).node({id: ":nodeId", idEncoded: true})}
            component={KgNodePage}
          />
          <Route
            path={hrefs.kg({id: kgId}).nodeLabel({
              label: ":nodeLabel",
              labelEncoded: true,
            })}
            component={KgNodeLabelPage}
          />
          <Route
            exact
            path={hrefs.kg({id: kgId}).randomNode}
            component={RandomKgNodePage}
          />
          <Route
            exact
            path={hrefs.kg({id: kgId}).search()}
            component={KgSearchResultsPage}
          />

          <Route component={KgNoRoute} />
        </Switch>
      </QueryParamProvider>
    </BrowserRouter>
  );
};
