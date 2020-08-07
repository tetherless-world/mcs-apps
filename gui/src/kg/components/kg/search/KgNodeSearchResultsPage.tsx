import * as React from "react";
import {Grid} from "@material-ui/core";
import {KgFrame} from "kg/components/frame/KgFrame";
import * as ReactDOM from "react-dom";
import {useApolloClient} from "@apollo/react-hooks";
import {
  KgNodeSearchResultsPageInitialQuery,
  KgNodeSearchResultsPageInitialQuery_kgById_matchingNodes as KgNode,
  KgNodeSearchResultsPageInitialQueryVariables,
} from "kg/api/queries/types/KgNodeSearchResultsPageInitialQuery";
import * as KgNodeSearchResultsPageInitialQueryDocument from "kg/api/queries/KgNodeSearchResultsPageInitialQuery.graphql";
import * as KgNodeSearchResultsPageRefinementQueryDocument from "kg/api/queries/KgNodeSearchResultsPageRefinementQuery.graphql";
import {KgNodeTable} from "shared/components/kg/node/KgNodeTable";
import {KgNodeQuery} from "kg/api/graphqlGlobalTypes";
import {KgNodeSearchVariables} from "shared/models/kg/node/KgNodeSearchVariables";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";
import {NumberParam, QueryParamConfig, useQueryParams} from "use-query-params";
import * as _ from "lodash";
import {
  KgNodeSearchResultsPageRefinementQuery,
  KgNodeSearchResultsPageRefinementQueryVariables,
} from "kg/api/queries/types/KgNodeSearchResultsPageRefinementQuery";
import {KgNodeFacetsGrid} from "kg/components/kg/search/KgNodeFacetsGrid";
import {KgNodeFacetsFragment} from "kg/api/queries/types/KgNodeFacetsFragment";
import {ApolloError} from "apollo-boost";

const LIMIT_DEFAULT = 10;
const OFFSET_DEFAULT = 0;

const queryQueryParamConfig: QueryParamConfig<KgNodeQuery | undefined> = {
  decode: (value) => (value ? JSON.parse(value as string) : undefined),
  encode: (value) => (!_.isEmpty(value) ? JSON.stringify(value) : undefined),
  equals: (left, right) => JSON.stringify(left) === JSON.stringify(right),
};

const makeTitle = (kwds: {
  count: number;
  query?: KgNodeQuery;
  sources: readonly KgSource[];
}): string => {
  const {count, query, sources} = kwds;

  let title: string[] = [];

  title.push(count + "" || "No");

  title.push("results");

  if (query && query.text) {
    title.push(`for "${query.text}"`);
  }

  if (query && query.filters) {
    if (query.filters.sourceIds) {
      const {include: includeSourceIds} = query.filters.sourceIds;

      if (includeSourceIds) {
        title.push("in");

        const includeSourceLabels = [];
        for (const includeSourceId of includeSourceIds) {
          const includeSource = sources.find(
            (source) => source.id === includeSourceId
          );
          includeSourceLabels.push(
            includeSource ? includeSource.label : includeSourceId
          );
        }

        title.push(includeSourceLabels.join(", "));
      }
    }
  }

  return title.join(" ");
};

export const KgNodeSearchResultsPage: React.FunctionComponent = () => {
  let [queryParams, setQueryParams] = useQueryParams({
    limit: NumberParam,
    offset: NumberParam,
    query: queryQueryParamConfig,
  });
  const searchVariables: KgNodeSearchVariables = {
    __typename: "KgNodeSearchVariables",
    limit: queryParams.limit ?? LIMIT_DEFAULT,
    offset: queryParams.offset ?? OFFSET_DEFAULT,
    query: queryParams.query ?? {},
  };

  const apolloClient = useApolloClient();

  const [error, setError] = React.useState<ApolloError | undefined>(undefined);
  const [data, setData] = React.useState<{
    nodeFacets: KgNodeFacetsFragment;
    nodes: readonly KgNode[];
    nodesCount: number;
    sources: readonly KgSource[];
  } | null>(null);

  const tableUpdateQuery = (newSearchVariables: KgNodeSearchVariables) => {
    console.info("New search variables: " + JSON.stringify(newSearchVariables));
    const limit = newSearchVariables.limit ?? LIMIT_DEFAULT;
    const offset = newSearchVariables.offset ?? OFFSET_DEFAULT;
    apolloClient
      .query<
        KgNodeSearchResultsPageRefinementQuery,
        KgNodeSearchResultsPageRefinementQueryVariables
      >({
        query: KgNodeSearchResultsPageRefinementQueryDocument,
        variables: {
          kgId,
          limit,
          offset,
          query: newSearchVariables.query ?? {},
        },
      })
      .then(({data, errors, loading}) => {
        if (errors) {
          setError(new ApolloError({graphQLErrors: errors}));
          return;
        } else if (loading) {
        } else if (!data) {
          throw new EvalError();
        }
        // React does not batch updates called in
        // "timouts, promises, async" code, so we
        // manually do it
        // Might be change in v17
        ReactDOM.unstable_batchedUpdates(() => {
          setData((prevState) =>
            Object.assign({}, prevState, {nodes: data.kgById.matchingNodes})
          );
          const newSearchVariablesCopy = Object.assign({}, newSearchVariables);
          delete newSearchVariablesCopy["__typename"];
          setQueryParams(newSearchVariablesCopy);
        });
      });
  };

  if (error == null && data === null) {
    apolloClient
      .query<
        KgNodeSearchResultsPageInitialQuery,
        KgNodeSearchResultsPageInitialQueryVariables
      >({
        query: KgNodeSearchResultsPageInitialQueryDocument,
        variables: {
          kgId,
          limit: searchVariables.limit!,
          offset: searchVariables.offset!,
          query: searchVariables.query ?? {},
        },
      })
      .then(({data, errors, loading}) => {
        if (errors) {
          setError(new ApolloError({graphQLErrors: errors}));
          return;
        } else if (loading) {
        } else if (!data) {
          throw new EvalError();
        }
        // React does not batch updates called in
        // "timouts, promises, async" code, so we
        // manually do it
        // Might be change in v17
        ReactDOM.unstable_batchedUpdates(() => {
          setData((prevState) =>
            Object.assign({}, prevState, {
              nodeFacets: data.kgById.matchingNodeFacets,
              nodes: data.kgById.matchingNodes,
              nodesCount: data.kgById.matchingNodesCount,
              sources: data.kgById.sources,
            })
          );
        });
      });
  }

  return (
    <KgFrame data={data} error={error} loading={data === null}>
      {({data}) => {
        // For the purposes of faceted search, the initial query results are considered the "universe".
        // Subsequent queries may limit results but cannot expand them.
        if (!data) {
          throw new EvalError();
        }
        return (
          <Grid container spacing={3}>
            <Grid item xs={10}>
              <KgNodeTable
                title={makeTitle({
                  count: data.nodesCount,
                  sources: data.sources,
                  ...searchVariables,
                })}
                nodes={data.nodes}
                rowsPerPage={searchVariables.limit!}
                count={data.nodesCount}
                page={searchVariables.offset! / searchVariables.limit!}
                onChangePage={(newPage: number) =>
                  tableUpdateQuery({
                    ...searchVariables,
                    offset: newPage * searchVariables.limit!,
                  })
                }
                onChangeRowsPerPage={(newRowsPerPage: number) =>
                  tableUpdateQuery({
                    ...searchVariables,
                    limit: newRowsPerPage,
                    offset: 0,
                  })
                }
              />
            </Grid>
            <Grid item xs={2}>
              <KgNodeFacetsGrid
                facets={data.nodeFacets}
                onChange={(newQuery) =>
                  tableUpdateQuery({...searchVariables, query: newQuery})
                }
                query={searchVariables.query ?? {}}
              />
            </Grid>
          </Grid>
        );
      }}
    </KgFrame>
  );
};
