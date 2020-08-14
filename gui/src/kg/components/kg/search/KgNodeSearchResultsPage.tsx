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
import {
  KgNodeQuery,
  KgNodeSort,
  KgNodeSortableField,
  SortDirection,
} from "kg/api/graphqlGlobalTypes";
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

class JsonQueryParamConfig<T> implements QueryParamConfig<T | undefined> {
  encode(value: T | undefined) {
    return !_.isEmpty(value) ? JSON.stringify(value) : undefined;
  }
  decode(value: string | (string | null)[] | null | undefined) {
    return value ? JSON.parse(value as string) : undefined;
  }
  equals(left: T | undefined, right: T | undefined) {
    return JSON.stringify(left) === JSON.stringify(right);
  }
}

const queryQueryParamConfig: QueryParamConfig<
  KgNodeQuery | undefined
> = new JsonQueryParamConfig<KgNodeQuery>();

const querySortsParamConfig: QueryParamConfig<
  KgNodeSort[] | undefined
> = new JsonQueryParamConfig<KgNodeSort[]>();

const makeTitle = (kwds: {
  count: number;
  query?: KgNodeQuery;
  sources: readonly KgSource[];
}): React.ReactNode => {
  const {count, query, sources} = kwds;

  let title: React.ReactNode[] = [];

  if (count > 0) {
    title.push(
      <span data-cy="count" key="count">
        {count}
      </span>
    );
  } else {
    title.push("No");
  }

  title.push("results");

  if (query && query.text) {
    title.push(
      <React.Fragment key="query-text">
        for <i data-cy="query-text">{query.text}</i>
      </React.Fragment>
    );
  }

  if (query && query.filters) {
    const filterRepresentations = [];
    if (query.filters.sourceIds) {
      const {
        exclude: excludeSourceIds,
        include: includeSourceIds,
      } = query.filters.sourceIds;

      const sourceLabels = (sourceIds: readonly string[]) => {
        const sourceLabels = [];
        for (const sourceId of sourceIds) {
          const source = sources.find((source) => source.id === sourceId);
          sourceLabels.push(source ? source.label : sourceId);
        }
        return sourceLabels;
      };

      if (excludeSourceIds) {
        filterRepresentations.push(
          <React.Fragment key="exclude-sources">
            not in&nbsp;
            <span data-cy="exclude-source-labels">
              {sourceLabels(excludeSourceIds).join(", ")}
            </span>
          </React.Fragment>
        );
      }
      if (includeSourceIds) {
        filterRepresentations.push(
          <React.Fragment key="include-sources">
            in&nbsp;
            <span data-cy="include-source-labels">
              {sourceLabels(includeSourceIds).join(", ")}
            </span>
          </React.Fragment>
        );
      }
    }
    switch (filterRepresentations.length) {
      case 0:
        break;
      case 1:
        title.push(
          <span data-cy="filters" key="filters">
            {filterRepresentations[0]}
          </span>
        );
        break;
      default:
        title.push(
          <span data-cy="filters" key="filters">
            {filterRepresentations.reduce((result, item) => (
              <React.Fragment key="filters">
                {result} and {item}
              </React.Fragment>
            ))}
          </span>
        );
    }
  }

  return (
    <>
      {title.reduce((result, item) => (
        <React.Fragment>
          {result}&nbsp;
          {item}
        </React.Fragment>
      ))}
    </>
  );
};

export const KgNodeSearchResultsPage: React.FunctionComponent = () => {
  let [queryParams, setQueryParams] = useQueryParams({
    limit: NumberParam,
    offset: NumberParam,
    query: queryQueryParamConfig,
    sorts: querySortsParamConfig,
  });
  const searchVariables: KgNodeSearchVariables = {
    __typename: "KgNodeSearchVariables",
    limit: queryParams.limit ?? LIMIT_DEFAULT,
    offset: queryParams.offset ?? OFFSET_DEFAULT,
    query: queryParams.query ?? {},
    sorts: queryParams.sorts,
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
          sorts: newSearchVariables.sorts,
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
              nodes: data.kgById.matchingNodes,
              nodesCount: data.kgById.matchingNodesCount,
            })
          );
          const newSearchVariablesCopy = Object.assign({}, newSearchVariables);
          delete newSearchVariablesCopy["__typename"];
          setQueryParams(newSearchVariablesCopy);
        });
      });
  };

  React.useEffect(() => {
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
          queryText: searchVariables?.query?.text,
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
        setData((prevState) =>
          Object.assign({}, prevState, {
            nodeFacets: data.kgById.matchingNodeFacets,
            nodes: data.kgById.matchingNodes,
            nodesCount: data.kgById.matchingNodesCount,
            sources: data.kgById.sources,
          })
        );
      });
  }, [queryParams]);

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
                onColumnSortChange={(
                  changedColumn: string,
                  direction: string
                ) => {
                  const sorts = searchVariables.sorts ?? [];

                  let sortField: KgNodeSortableField;

                  switch (changedColumn) {
                    // case "id":
                    //   sortField = KgNodeSortableField.Id;
                    //   break;
                    case "label":
                      sortField = KgNodeSortableField.Labels;
                      break;
                    case "sources":
                      sortField = KgNodeSortableField.Sources;
                      break;
                    case "pageRank":
                      sortField = KgNodeSortableField.PageRank;
                      break;
                    default:
                      throw new Error("Changed column not supported");
                  }

                  // const sortIndex = sorts.findIndex(
                  //   (sort) => sort.field === sortField
                  // );
                  const sortIndex = 0;

                  const newSort = {
                    field: sortField,
                    direction:
                      direction === "asc"
                        ? SortDirection.Ascending
                        : SortDirection.Descending,
                  };

                  if (sorts.length === 0) {
                    //if (sortIndex === -1) {
                    sorts.push(newSort);
                  } else {
                    sorts.splice(sortIndex, 1, newSort);
                  }

                  tableUpdateQuery({
                    ...searchVariables,
                    sorts,
                  });
                }}
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
