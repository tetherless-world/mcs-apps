import * as React from "react";
import {Grid} from "@material-ui/core";
import {KgFrame} from "kg/components/frame/KgFrame";
import * as ReactDOM from "react-dom";
import {useApolloClient, useQuery} from "@apollo/react-hooks";
import {
  KgNodeSearchResultsPageQuery,
  KgNodeSearchResultsPageQuery_kgById_matchingNodes as KgNode,
  KgNodeSearchResultsPageQueryVariables,
} from "kg/api/queries/types/KgNodeSearchResultsPageQuery";
import * as KgNodeSearchResultsPageQueryDocument from "kg/api/queries/KgNodeSearchResultsPageQuery.graphql";
import {KgNodeTable} from "shared/components/kg/node/KgNodeTable";
import {KgNodeFilters} from "kg/api/graphqlGlobalTypes";
import {KgNodeSearchVariables} from "shared/models/kg/KgNodeSearchVariables";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/KgSource";
import {
  NumberParam,
  StringParam,
  useQueryParams,
  QueryParamConfig,
} from "use-query-params";

const LIMIT_DEFAULT = 10;
const OFFSET_DEFAULT = 0;

const filtersQueryParamConfig: QueryParamConfig<KgNodeFilters | undefined> = {
  decode: (value) => (value ? JSON.parse(value as string) : undefined),
  encode: (value) => (value ? JSON.stringify(value) : undefined),
  equals: (left, right) => JSON.stringify(left) === JSON.stringify(right),
};

const makeTitle = (kwds: {
  count: number;
  filters?: KgNodeFilters;
  sources: KgSource[];
  text?: string;
}): string => {
  const {text, count, filters, sources} = kwds;

  let title: string[] = [];

  title.push(count + "" || "No");

  title.push("results");

  if (text) {
    title.push(`for "${text}"`);
  }

  if (filters) {
    if (filters.sources) {
      const {include: includeSourceIds} = filters.sources;

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
    filters: filtersQueryParamConfig,
    limit: NumberParam,
    offset: NumberParam,
    text: StringParam,
  });
  const searchVariables: KgNodeSearchVariables = {
    __typename: "KgNodeSearchVariables",
    filters: queryParams.filters,
    limit: queryParams.limit ?? LIMIT_DEFAULT,
    offset: queryParams.offset ?? OFFSET_DEFAULT,
    text: queryParams.text ? queryParams.text : undefined,
  };

  const {data, loading, error} = useQuery<
    KgNodeSearchResultsPageQuery,
    KgNodeSearchResultsPageQueryVariables
  >(KgNodeSearchResultsPageQueryDocument, {
    variables: {
      initialQuery: true,
      kgId,
      ...searchVariables,
      limit: searchVariables.limit!,
      offset: searchVariables.offset!,
    },
  });

  const apolloClient = useApolloClient();

  const [nodes, setNodes] = React.useState<KgNode[] | null>(null);

  const tableUpdateQuery = (newSearchVariables: KgNodeSearchVariables) => {
    const limit = newSearchVariables.limit ?? LIMIT_DEFAULT;
    const offset = newSearchVariables.offset ?? OFFSET_DEFAULT;
    apolloClient
      .query<
        KgNodeSearchResultsPageQuery,
        KgNodeSearchResultsPageQueryVariables
      >({
        query: KgNodeSearchResultsPageQueryDocument,
        variables: {
          kgId,
          filters: newSearchVariables.filters,
          limit,
          offset,
          initialQuery: false,
          text: newSearchVariables.text,
        },
      })
      .then(({data, errors, loading}) => {
        if (errors) {
        } else if (loading) {
        } else if (!data) {
          throw new EvalError();
        }
        // React does not batch updates called in
        // "timouts, promises, async" code, so we
        // manually do it
        // Might be change in v17
        ReactDOM.unstable_batchedUpdates(() => {
          setNodes(data.kgById.matchingNodes);
          const newSearchVariablesCopy = Object.assign({}, newSearchVariables);
          delete newSearchVariablesCopy["__typename"];
          setQueryParams(newSearchVariablesCopy);
        });
      });
  };

  return (
    <KgFrame data={data} error={error} loading={loading}>
      {({
        data: {
          kgById: {
            matchingNodes: initialNodes,
            matchingNodesCount: count,
            sources,
          },
        },
      }) => {
        return (
          <Grid container spacing={3}>
            <Grid item xs>
              <KgNodeTable
                title={makeTitle({
                  count,
                  sources,
                  ...searchVariables,
                })}
                nodes={nodes ?? initialNodes}
                rowsPerPage={searchVariables.limit!}
                count={count}
                page={searchVariables.offset! / searchVariables.limit!}
                onChangePage={(newPage: number) =>
                  tableUpdateQuery(
                    Object.assign({}, searchVariables, {
                      offset: newPage * searchVariables.limit!,
                    })
                  )
                }
                onChangeRowsPerPage={(newRowsPerPage: number) =>
                  tableUpdateQuery(
                    Object.assign({}, searchVariables, {
                      limit: newRowsPerPage,
                      offset: 0,
                    })
                  )
                }
              />
            </Grid>
          </Grid>
        );
      }}
    </KgFrame>
  );
};
