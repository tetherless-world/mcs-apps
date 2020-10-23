import {apolloClient} from "benchmark/api/apolloClient";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "@apollo/react-hooks";
import {CssBaseline} from "@material-ui/core";
import {BenchmarkRoutes} from "./BenchmarkRoutes";
import {HrefsContext} from "shared/HrefsContext";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import {BenchmarkHrefsContext} from "benchmark/BenchmarkHrefsContext";

const hrefs = new BenchmarkHrefs("/");

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <ApolloHooksProvider client={apolloClient}>
      <BenchmarkHrefsContext.Provider value={hrefs}>
        <HrefsContext.Provider value={hrefs}>
          <CssBaseline />
          <BenchmarkRoutes />
        </HrefsContext.Provider>
      </BenchmarkHrefsContext.Provider>
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
