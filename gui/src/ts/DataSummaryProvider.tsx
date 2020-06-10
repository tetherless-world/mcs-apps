import * as React from "react";

import {useQuery} from "@apollo/react-hooks";

import {DataSummary} from "api/queries/types/DataSummary";
import * as DataSummaryQueryDocument from "api/queries/DataSummaryQuery.graphql";

export const DataSummaryContext = React.createContext<DataSummary | undefined>(
  undefined
);

export const DataSummaryProvider: React.FunctionComponent = ({children}) => {
  // Initial expensive load for static data
  const {data} = useQuery<DataSummary>(DataSummaryQueryDocument);

  return (
    <DataSummaryContext.Provider value={data}>
      {children}
    </DataSummaryContext.Provider>
  );
};
