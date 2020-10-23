import {apolloClient} from "kg/api/apolloClient";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "@apollo/react-hooks";
import {CssBaseline} from "@material-ui/core";
import {KgRoutes} from "./KgRoutes";
import {KgHrefs} from "kg/KgHrefs";
import {HrefsContext} from "shared/HrefsContext";

const hrefs = new KgHrefs();

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <ApolloHooksProvider client={apolloClient}>
      <HrefsContext.Provider value={hrefs}>
        <CssBaseline />
        <KgRoutes />
      </HrefsContext.Provider>
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
