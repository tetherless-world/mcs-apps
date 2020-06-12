import {BrowserRouter, Route, Switch} from "react-router-dom";
import {KgNodeSearchResultsPage} from "./components/pages/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "./components/pages/KgNodePage";
import {NoRoute} from "./components/error/NoRoute";
import {HomePage} from "./components/HomePage";
import {Hrefs} from "./Hrefs";
import {RandomKgNodePage} from "./components/pages/RandomKgNodePage";
import {KgPathPage} from "components/pages/KgPathPage";
import {kgId} from "api/kgId";

export const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route
        component={KgNodeSearchResultsPage}
        path={Hrefs.kg(kgId).nodeSearch()}
      ></Route>
      <Route component={KgNodePage} path="/node/:nodeId" />
      <Route exact component={KgPathPage} path={Hrefs.kg(kgId).paths} />
      <Route
        exact
        component={RandomKgNodePage}
        path={Hrefs.kg(kgId).randomNode}
      />
      <Route exact component={HomePage} path={Hrefs.home}></Route>
      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
