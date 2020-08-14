import * as React from "react";
import {Grid} from "@material-ui/core";
import {KgFrame} from "kg/components/frame/KgFrame";
import * as ReactDOM from "react-dom";
import {useApolloClient} from "@apollo/react-hooks";
import * as KgNodeSearchResultsPageNodeFacetsQueryDocument from "kg/api/queries/KgNodeSearchResultsPageNodeFacetsQuery.graphql";
import * as KgNodeSearchResultsPageNodesQueryDocument from "kg/api/queries/KgNodeSearchResultsPageNodesQuery.graphql";
import {KgNodeTable} from "shared/components/kg/node/KgNodeTable";
import {
  KgNodeQuery,
  KgNodeSort,
  KgNodeSortableField,
  SortDirection,
} from "kg/api/graphqlGlobalTypes";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";
import {NumberParam, QueryParamConfig, useQueryParam} from "use-query-params";
import * as _ from "lodash";
import {
  KgNodeSearchResultsPageNodesQuery,
  KgNodeSearchResultsPageNodesQueryVariables,
} from "kg/api/queries/types/KgNodeSearchResultsPageNodesQuery";
import {KgNodeFacetsGrid} from "kg/components/kg/search/KgNodeFacetsGrid";
import {KgNodeFacetsFragment} from "kg/api/queries/types/KgNodeFacetsFragment";
import {ApolloError} from "apollo-boost";
import {
  KgNodeSearchResultsPageNodeFacetsQuery,
  KgNodeSearchResultsPageNodeFacetsQueryVariables,
} from "kg/api/queries/types/KgNodeSearchResultsPageNodeFacetsQuery";
import {KgNode} from "shared/models/kg/node/KgNode";
import * as ReactLoader from "react-loader";

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
    // console.info(
    //   `Testing equality ${JSON.stringify(left)} and ${JSON.stringify(right)}: ${
    //     JSON.stringify(left) === JSON.stringify(right)
    //   }`
    // );
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
  let [limitQueryParam, setLimitQueryParam] = useQueryParam<
    number | null | undefined
  >("limit", NumberParam);
  let [offsetQueryParam, setOffsetQueryParam] = useQueryParam<
    number | null | undefined
  >("offset", NumberParam);
  let [queryQueryParam, setQueryQueryParam] = useQueryParam<
    KgNodeQuery | undefined
  >("query", queryQueryParamConfig);
  let [sortsQueryParam, setSortsQueryParam] = useQueryParam<
    KgNodeSort[] | undefined
  >("sorts", querySortsParamConfig);

  const apolloClient = useApolloClient();

  // Node facets are loaded whenever "query" changes
  // Nodes are loaded whenever "limith", "offset", "query", or "sorts" are loaded
  const [error, setError] = React.useState<ApolloError | undefined>(undefined);
  const [loadingNodeFacets, setLoadingNodeFacets] = React.useState<boolean>(
    true
  );
  const [loadingNodes, setLoadingNodes] = React.useState<boolean>(true);
  // console.info(
  //   `Loading: node facets: ${loadingNodeFacets}, nodes: ${loadingNodes}`
  // );
  const [nodeFacets, setNodeFacets] = React.useState<{
    nodeFacets: KgNodeFacetsFragment;
    nodesCount: number;
    sources: readonly KgSource[];
  } | null>(null);
  const [nodes, setNodes] = React.useState<readonly KgNode[]>();

  React.useEffect(() => {
    console.info("Running node facets query");
    setLoadingNodeFacets(true);
    apolloClient
      .query<
        KgNodeSearchResultsPageNodeFacetsQuery,
        KgNodeSearchResultsPageNodeFacetsQueryVariables
      >({
        fetchPolicy: "no-cache",
        query: KgNodeSearchResultsPageNodeFacetsQueryDocument,
        variables: {
          kgId,
          query: queryQueryParam ?? {},
          queryText: queryQueryParam?.text,
        },
      })
      .then(({data, errors, loading}) => {
        if (errors) {
          setError(new ApolloError({graphQLErrors: errors}));
          return;
        } else if (loading) {
          setLoadingNodeFacets(true);
          return;
        } else if (!data) {
          throw new EvalError();
        }
        ReactDOM.unstable_batchedUpdates(() => {
          setLoadingNodeFacets(false);
          setNodeFacets((prevState) =>
            Object.assign({}, prevState, {
              nodeFacets: data.kgById.matchingNodeFacets,
              nodesCount: data.kgById.matchingNodesCount,
              sources: data.kgById.sources,
            })
          );
        });
      });
  }, [queryQueryParam]);

  React.useEffect(() => {
    console.info("Running nodes query");
    setLoadingNodes(true);
    const limit = limitQueryParam ?? LIMIT_DEFAULT;
    const offset = offsetQueryParam ?? OFFSET_DEFAULT;
    apolloClient
      .query<
        KgNodeSearchResultsPageNodesQuery,
        KgNodeSearchResultsPageNodesQueryVariables
      >({
        fetchPolicy: "no-cache",
        query: KgNodeSearchResultsPageNodesQueryDocument,
        variables: {
          kgId,
          limit,
          offset,
          query: queryQueryParam ?? {},
          sorts: sortsQueryParam,
        },
      })
      .then(({data, errors, loading}) => {
        if (errors) {
          setError(new ApolloError({graphQLErrors: errors}));
          return;
        } else if (loading) {
          setLoadingNodes(true);
          return;
        } else if (!data) {
          throw new EvalError();
        }
        // React does not batch updates called in
        // "timouts, promises, async" code, so we
        // manually do it
        // Might be change in v17
        ReactDOM.unstable_batchedUpdates(() => {
          setLoadingNodes(false);
          setNodes((prevState) => data.kgById.matchingNodes);
        });
      });
  }, [limitQueryParam, offsetQueryParam, sortsQueryParam]);

  return (
    <KgFrame
      data={
        nodes && nodeFacets ? Object.assign({}, {nodes}, nodeFacets) : undefined
      }
      error={error}
      // KgFrame doesn't render the table if loading is true
      // That's fine for the initial queries, but not if the table is already rendered. It looks awkward.
      // In that case show our own loader.
      loading={!nodes || !nodeFacets}
    >
      {({data}) => {
        // For the purposes of faceted search, the initial query results are considered the "universe".
        // Subsequent queries may limit results but cannot expand them.
        if (!data) {
          throw new EvalError();
        }
        return (
          <>
            {loadingNodeFacets || loadingNodes ? (
              <ReactLoader loaded={false} />
            ) : null}
            <Grid container spacing={3}>
              <Grid item xs={10}>
                <KgNodeTable
                  title={makeTitle({
                    count: data.nodesCount,
                    sources: data.sources,
                    query: queryQueryParam,
                  })}
                  nodes={data.nodes}
                  rowsPerPage={limitQueryParam ?? LIMIT_DEFAULT}
                  count={data.nodesCount}
                  page={
                    (offsetQueryParam ?? OFFSET_DEFAULT) /
                    (limitQueryParam ?? LIMIT_DEFAULT)
                  }
                  onChangePage={(newPage: number) =>
                    setOffsetQueryParam(
                      newPage * (limitQueryParam ?? LIMIT_DEFAULT)
                    )
                  }
                  onChangeRowsPerPage={(newRowsPerPage: number) => {
                    setLimitQueryParam(newRowsPerPage);
                    setOffsetQueryParam(0);
                  }}
                  onColumnSortChange={(
                    changedColumn: string,
                    direction: string
                  ) => {
                    const sorts = sortsQueryParam?.concat() ?? [];

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

                    setSortsQueryParam(sorts);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <KgNodeFacetsGrid
                  facets={data.nodeFacets}
                  onChange={(newQuery) => {
                    setLimitQueryParam(LIMIT_DEFAULT);
                    setOffsetQueryParam(OFFSET_DEFAULT);
                    setQueryQueryParam(newQuery);
                  }}
                  query={queryQueryParam ?? {}}
                />
              </Grid>
            </Grid>
          </>
        );
      }}
    </KgFrame>
  );
};
