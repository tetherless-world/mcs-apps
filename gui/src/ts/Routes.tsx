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
import {BenchmarksPage} from "components/benchmark/BenchmarksPage";
import {BenchmarkPage} from "components/benchmark/BenchmarkPage";

export const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path={Hrefs.home}>
        <Redirect to={Hrefs.kgs} />
      </Route>

      <Route exact path={Hrefs.benchmarks} component={BenchmarksPage} />
      <Route
        exact
        path={Hrefs.benchmark({id: ":benchmarkId", idEncoded: true}).home}
        component={BenchmarkPage}
      />

      {/* KG Routes */}
      <Route
        exact
        path={Hrefs.kg({id: kgId}).nodeSearch()}
        component={KgNodeSearchResultsPage}
      />
      <Route
        exact
        path={Hrefs.kg({id: kgId}).node({id: ":nodeId", idEncoded: true})}
        component={KgNodePage}
      />
      <Route exact path={Hrefs.kg({id: kgId}).paths} component={KgPathPage} />
      <Route
        exact
        path={Hrefs.kg({id: kgId}).randomNode}
        component={RandomKgNodePage}
      />
      <Route exact path={Hrefs.kgs} component={KgHomePage} />

      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
