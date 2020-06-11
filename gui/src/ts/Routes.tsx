import {BrowserRouter, Route, Switch} from "react-router-dom";
import {NodeSearchResultsPage} from "./components/pages/NodeSearchResultsPage";
import * as React from "react";
import {NodePage} from "./components/pages/NodePage";
import {NoRoute} from "./components/error/NoRoute";
import {HomePage} from "./components/pages/HomePage";
import {Hrefs} from "./Hrefs";
import {RandomNodePage} from "./components/pages/RandomNodePage";
import {PathPage} from "components/pages/PathPage";

export const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route
        component={NodeSearchResultsPage}
        path={Hrefs.nodeSearch()}
      ></Route>
      <Route component={NodePage} path="/node/:nodeId" />
      <Route exact component={PathPage} path={Hrefs.paths} />
      <Route exact component={RandomNodePage} path={Hrefs.randomNode} />
      <Route exact component={HomePage} path={Hrefs.home}></Route>
      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
