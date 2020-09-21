import {apolloClient} from "kg/api/apolloClient";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "@apollo/react-hooks";
import {CssBaseline} from "@material-ui/core";
import {KgRoutes} from "./KgRoutes";

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <ApolloHooksProvider client={apolloClient}>
      <CssBaseline />
      <KgRoutes />
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
