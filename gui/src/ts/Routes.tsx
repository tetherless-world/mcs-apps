import {BrowserRouter, Route, Switch} from "react-router-dom";
import {KgNodeSearchResultsPage} from "./components/pages/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "./components/pages/KgNodePage";
import {NoRoute} from "./components/error/NoRoute";
import {HomePage} from "./components/pages/HomePage";
import {Hrefs} from "./Hrefs";
import {RandomKgNodePage} from "./components/pages/RandomKgNodePage";
import {KgPathPage} from "components/pages/KgPathPage";

export const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route
        component={KgNodeSearchResultsPage}
        path={Hrefs.nodeSearch()}
      ></Route>
      <Route component={KgNodePage} path="/node/:nodeId" />
      <Route exact component={KgPathPage} path={Hrefs.paths} />
      <Route exact component={RandomKgNodePage} path={Hrefs.randomNode} />
      <Route exact component={HomePage} path={Hrefs.home}></Route>
      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
