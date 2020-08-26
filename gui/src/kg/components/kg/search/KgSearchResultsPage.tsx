import * as React from "react";
import {Grid} from "@material-ui/core";
import {KgFrame} from "kg/components/frame/KgFrame";
import * as ReactDOM from "react-dom";
import {useApolloClient} from "@apollo/react-hooks";
import * as KgSearchResultsPageFacetsQueryDocument from "kg/api/queries/KgSearchResultsPageFacetsQuery.graphql";
import * as KgSearchResultsPageResultsQueryDocument from "kg/api/queries/KgSearchResultsPageResultsQuery.graphql";
import {
  KgNodeSortableField,
  KgSearchQuery,
  KgSearchSort,
  SortDirection,
} from "kg/api/graphqlGlobalTypes";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/source/KgSource";
import {NumberParam, QueryParamConfig, useQueryParam} from "use-query-params";
import * as _ from "lodash";
import {
  KgSearchResultsPageResultsQuery,
  KgSearchResultsPageResultsQuery_kgById_search,
  KgSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult,
  KgSearchResultsPageResultsQueryVariables,
} from "kg/api/queries/types/KgSearchResultsPageResultsQuery";
import {KgSearchFacetsGrid} from "kg/components/kg/search/KgSearchFacetsGrid";
import {KgSearchFacetsFragment} from "kg/api/queries/types/KgSearchFacetsFragment";
import {ApolloError} from "apollo-boost";
import {
  KgSearchResultsPageFacetsQuery,
  KgSearchResultsPageFacetsQueryVariables,
} from "kg/api/queries/types/KgSearchResultsPageFacetsQuery";
import * as ReactLoader from "react-loader";
import {KgSearchResultsTable} from "kg/components/kg/search/KgSearchResultsTable";

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
  KgSearchQuery | undefined
> = new JsonQueryParamConfig<KgSearchQuery>();

const querySortsParamConfig: QueryParamConfig<
  KgSearchSort[] | undefined
> = new JsonQueryParamConfig<KgSearchSort[]>();

const makeTitle = (kwds: {
  count: number;
  query?: KgSearchQuery;
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

export const KgSearchResultsPage: React.FunctionComponent = () => {
  let [limitQueryParam, setLimitQueryParam] = useQueryParam<
    number | null | undefined
  >("limit", NumberParam);
  let [offsetQueryParam, setOffsetQueryParam] = useQueryParam<
    number | null | undefined
  >("offset", NumberParam);
  let [queryQueryParam, setQueryQueryParam] = useQueryParam<
    KgSearchQuery | undefined
  >("query", queryQueryParamConfig);
  let [sortsQueryParam, setSortsQueryParam] = useQueryParam<
    KgSearchSort[] | undefined
  >("sorts", querySortsParamConfig);

  const apolloClient = useApolloClient();

  // Node facets are loaded whenever "query" changes
  // Nodes are loaded whenever "limith", "offset", "query", or "sorts" are loaded
  const [error, setError] = React.useState<ApolloError | undefined>(undefined);
  const [loadingFacets, setLoadingFacets] = React.useState<boolean>(true);
  const [loadingResults, setLoadingResults] = React.useState<boolean>(true);
  // console.info(
  //   `Loading: node facets: ${loadingFacets}, results: ${loadingResults}`
  // );
  const [facets, setFacets] = React.useState<{
    facets: KgSearchFacetsFragment;
    resultsCount: number;
    sources: readonly KgSource[];
  } | null>(null);
  const [results, setResults] = React.useState<
    KgSearchResultsPageResultsQuery_kgById_search[]
  >();

  React.useEffect(() => {
    console.info("Running facets query");
    setLoadingFacets(true);
    apolloClient
      .query<
        KgSearchResultsPageFacetsQuery,
        KgSearchResultsPageFacetsQueryVariables
      >({
        fetchPolicy: "no-cache",
        query: KgSearchResultsPageFacetsQueryDocument,
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
          setLoadingFacets(true);
          return;
        } else if (!data) {
          throw new EvalError();
        }
        ReactDOM.unstable_batchedUpdates(() => {
          setLoadingFacets(false);
          setFacets((prevState) =>
            Object.assign({}, prevState, {
              facets: data.kgById.searchFacets,
              resultsCount: data.kgById.searchCount,
              sources: data.kgById.sources,
            })
          );
        });
      });
  }, [queryQueryParam]);

  React.useEffect(() => {
    console.info("Running results query");
    setLoadingResults(true);
    const limit = limitQueryParam ?? LIMIT_DEFAULT;
    const offset = offsetQueryParam ?? OFFSET_DEFAULT;
    apolloClient
      .query<
        KgSearchResultsPageResultsQuery,
        KgSearchResultsPageResultsQueryVariables
      >({
        fetchPolicy: "no-cache",
        query: KgSearchResultsPageResultsQueryDocument,
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
          setLoadingResults(true);
          return;
        } else if (!data) {
          throw new EvalError();
        }
        // React does not batch updates called in
        // "timouts, promises, async" code, so we
        // manually do it
        // Might be change in v17
        ReactDOM.unstable_batchedUpdates(() => {
          setLoadingResults(false);
          setResults((prevState) => data.kgById.search);
        });
      });
  }, [limitQueryParam, offsetQueryParam, sortsQueryParam]);

  return (
    <KgFrame
      data={
        results && facets ? Object.assign({}, {results}, facets) : undefined
      }
      error={error}
      // KgFrame doesn't render the table if loading is true
      // That's fine for the initial queries, but not if the table is already rendered. It looks awkward.
      // In that case show our own loader.
      loading={!results || !facets}
    >
      {({data}) => {
        // For the purposes of faceted search, the initial query results are considered the "universe".
        // Subsequent queries may limit results but cannot expand them.
        if (!data) {
          throw new EvalError();
        }
        return (
          <>
            {loadingFacets || loadingResults ? (
              <ReactLoader loaded={false} />
            ) : null}
            <Grid container spacing={3}>
              <Grid item xs={10}>
                <KgSearchResultsTable
                  title={makeTitle({
                    count: data.resultsCount,
                    sources: data.sources,
                    query: queryQueryParam,
                  })}
                  nodes={data.results
                    .filter(
                      (result) => result.__typename == "KgNodeSearchResult"
                    )
                    .map(
                      (result) =>
                        (result as KgSearchResultsPageResultsQuery_kgById_search_KgNodeSearchResult)
                          .node
                    )}
                  rowsPerPage={limitQueryParam ?? LIMIT_DEFAULT}
                  count={data.resultsCount}
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
                <KgSearchFacetsGrid
                  facets={data.facets}
                  onChange={(newQuery) => {
                    setLimitQueryParam(LIMIT_DEFAULT);
                    setOffsetQueryParam(OFFSET_DEFAULT);
                    setQueryQueryParam(newQuery);
                  }}
                  query={queryQueryParam ?? {}}
                  sources={data.sources}
                />
              </Grid>
            </Grid>
          </>
        );
      }}
    </KgFrame>
  );
};
