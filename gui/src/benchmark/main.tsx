import {apolloClient} from "benchmark/api/apolloClient";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "@apollo/react-hooks";
import {CssBaseline} from "@material-ui/core";
import {BenchmarkRoutes} from "./BenchmarkRoutes";

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <ApolloHooksProvider client={apolloClient}>
      <CssBaseline />
      <BenchmarkRoutes />
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
