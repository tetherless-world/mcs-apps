import {apolloClient} from "api/apolloClient";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "@apollo/react-hooks";
import {CssBaseline} from "@material-ui/core";
import {ConsoleLogger, LoggerContext} from "@tetherless-world/twxplore-base";
import {Routes} from "./Routes";
import {DataSummaryProvider} from "./DataSummaryProvider";

// Logger
const logger = new ConsoleLogger();

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <ApolloHooksProvider client={apolloClient}>
      <LoggerContext.Provider value={logger}>
        <DataSummaryProvider>
          <CssBaseline />
          <Routes />
        </DataSummaryProvider>
      </LoggerContext.Provider>
    </ApolloHooksProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
