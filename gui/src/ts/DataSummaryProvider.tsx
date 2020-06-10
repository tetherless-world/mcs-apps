import * as React from "react";

import {useQuery} from "@apollo/react-hooks";

import {DataSummaryQuery} from "api/queries/types/DataSummaryQuery";
import * as DataSummaryQueryDocument from "api/queries/DataSummaryQuery.graphql";

export const DataSummaryContext = React.createContext<
  DataSummaryQuery | undefined
>(undefined);

export const DataSummaryProvider: React.FunctionComponent = ({children}) => {
  // Initial expensive load for static data
  const {data} = useQuery<DataSummaryQuery>(DataSummaryQueryDocument);

  return (
    <DataSummaryContext.Provider value={data}>
      {children}
    </DataSummaryContext.Provider>
  );
};
