import * as React from "react";

import {useQuery} from "@apollo/react-hooks";

import {KgDataSummaryQuery} from "api/queries/types/KgDataSummaryQuery";
import * as DataSummaryQueryDocument from "api/queries/KgDataSummaryQuery.graphql";
import {ApolloErrorHandler} from "./components/error/ApolloErrorHandler";

export const KgDataSummaryContext = React.createContext<
  KgDataSummaryQuery | undefined
>(undefined);

export const KgDataSummaryProvider: React.FunctionComponent = ({children}) => {
  // Initial expensive load for static data
  const {data, error} = useQuery<KgDataSummaryQuery>(DataSummaryQueryDocument);

  if (error) {
    return <ApolloErrorHandler error={error} />;
  }

  return (
    <KgDataSummaryContext.Provider value={data}>
      {children}
    </KgDataSummaryContext.Provider>
  );
};
