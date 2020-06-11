import * as React from "react";

import {useQuery} from "@apollo/react-hooks";

import {DataSummaryQuery} from "api/queries/types/DataSummaryQuery";
import * as DataSummaryQueryDocument from "api/queries/DataSummaryQuery.graphql";
import {ApolloErrorHandler} from "./components/error/ApolloErrorHandler";

export const DataSummaryContext = React.createContext<
  DataSummaryQuery | undefined
>(undefined);

export const DataSummaryProvider: React.FunctionComponent = ({children}) => {
  // Initial expensive load for static data
  const {data, error} = useQuery<DataSummaryQuery>(DataSummaryQueryDocument);

  if (error) {
    return <ApolloErrorHandler error={error} />;
  }

  return (
    <DataSummaryContext.Provider value={data}>
      {children}
    </DataSummaryContext.Provider>
  );
};
