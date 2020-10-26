import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory";

import ApolloClient from "apollo-boost";
import {Hrefs} from "shared/Hrefs";

export const createApolloClient = (kwds: {
  hrefs: Hrefs;
  introspectionQueryResultData: any;
}) => {
  const {hrefs, introspectionQueryResultData} = kwds;

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: (introspectionQueryResultData as any).default,
  });

  const cache = new InMemoryCache({fragmentMatcher});

  return new ApolloClient({
    cache,
    uri: hrefs.base + "api/graphql",
  });
};
