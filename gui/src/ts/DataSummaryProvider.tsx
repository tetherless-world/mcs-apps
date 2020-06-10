import * as React from "react";

import {useQuery} from "@apollo/react-hooks";

import {DatasourcesQuery} from "api/queries/types/DatasourcesQuery";
import * as DatasourcesQueryDocument from "api/queries/DatasourcesQuery.graphql";

interface DataSummary {
  datasources: string[];
}

export const DataSummaryContext = React.createContext<DataSummary | undefined>(
  undefined
);

export const DataSummaryProvider: React.FunctionComponent = ({children}) => {
  // Initial expensive load for static data
  const {data} = useQuery<DatasourcesQuery>(DatasourcesQueryDocument);

  return (
    <DataSummaryContext.Provider value={data}>
      {children}
    </DataSummaryContext.Provider>
  );
};
