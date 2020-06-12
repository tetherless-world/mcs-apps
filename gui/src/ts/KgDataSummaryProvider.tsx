import * as React from "react";

import {useQuery} from "@apollo/react-hooks";

import {KgDataSummaryQuery} from "api/queries/kg/types/KgDataSummaryQuery";
import * as KgDataSummaryQueryDocument from "api/queries/kg/KgDataSummaryQuery.graphql";
import {ApolloErrorHandler} from "./components/error/ApolloErrorHandler";
import {kgId} from "./api/kgId";

export const KgDataSummaryContext = React.createContext<
  KgDataSummaryQuery | undefined
>(undefined);

export const KgDataSummaryProvider: React.FunctionComponent = ({children}) => {
  // Initial expensive load for static data
  const {data, error} = useQuery<KgDataSummaryQuery>(
    KgDataSummaryQueryDocument,
    {
      variables: {kgId},
    }
  );

  if (error) {
    return <ApolloErrorHandler error={error} />;
  }

  return (
    <KgDataSummaryContext.Provider value={data}>
      {children}
    </KgDataSummaryContext.Provider>
  );
};
