import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import {KgNodeSearchResultsPage} from "components/kg/search/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "components/kg/node/KgNodePage";
import {NoRoute} from "components/error/NoRoute";
import {KgHomePage} from "components/kg/KgHomePage";
import {Hrefs} from "Hrefs";
import {RandomKgNodePage} from "components/kg/node/RandomKgNodePage";
import {KgPathPage} from "components/kg/path/KgPathPage";
import {kgId} from "api/kgId";
import {BenchmarkHomePage} from "components/benchmark/BenchmarkHomePage";

export const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path={Hrefs.home}>
        <Redirect to={Hrefs.kgRoot} />
      </Route>

      {/* KG Routes */}
      <Route
        path={Hrefs.kg(kgId).nodeSearch()}
        component={KgNodeSearchResultsPage}
      />
      <Route
        path={`${Hrefs.kgRoot}/:kgId/node/:nodeId`}
        component={KgNodePage}
      />
      <Route path={Hrefs.kg(kgId).paths} component={KgPathPage} />
      <Route
        exact
        path={Hrefs.kg(kgId).randomNode}
        component={RandomKgNodePage}
      />
      <Route exact path={Hrefs.kgRoot} component={KgHomePage} />

      {/* Benchmark Routes */}
      <Route path={Hrefs.benchmarks} component={BenchmarkHomePage} />

      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
