import * as React from "react";
import {Grid} from "@material-ui/core";
import {KgFrame} from "kg/components/frame/KgFrame";
import * as ReactDOM from "react-dom";
import {useQuery, useApolloClient} from "@apollo/react-hooks";
import {
  KgNodeSearchResultsPageQuery,
  KgNodeSearchResultsPageQueryVariables,
  KgNodeSearchResultsPageQuery_kgById_matchingNodes as KgNode,
} from "kg/api/queries/types/KgNodeSearchResultsPageQuery";
import * as KgNodeSearchResultsPageQueryDocument from "kg/api/queries/KgNodeSearchResultsPageQuery.graphql";
import {KgNodeTable} from "shared/components/kg/node/KgNodeTable";
import {useLocation, useHistory} from "react-router-dom";
import * as qs from "qs";
import {KgNodeFilters} from "kg/api/graphqlGlobalTypes";
import {KgNodeSearchVariables} from "shared/models/kg/KgNodeSearchVariables";
import {kgId} from "shared/api/kgId";
import {KgSource} from "shared/models/kg/KgSource";

class QueryStringKgNodeSearchVariables implements KgNodeSearchVariables {
  public readonly __typename = "KgNodeSearchVariables";

  private constructor(
    public readonly text: string,
    public readonly filters: KgNodeFilters | undefined = undefined,
    public readonly offset: number = 0,
    public readonly limit: number = 10
  ) {}

  get page() {
    return this.offset / this.limit;
  }

  get object() {
    return {
      text: this.text,
      filters: this.filters,
      offset: this.offset,
      limit: this.limit,
    };
  }

  static parse(queryString: string) {
    const {text, filters, offset, limit} = (qs.parse(queryString, {
      ignoreQueryPrefix: true,
    }) as unknown) as {
      text: string;
      filters: KgNodeFilters | undefined;
      offset: string;
      limit: string;
    };
    return new QueryStringKgNodeSearchVariables(
      text,
      filters,
      offset === undefined ? undefined : +offset,
      limit === undefined ? undefined : +limit
    );
  }

  stringify() {
    return qs.stringify(this.object, {addQueryPrefix: true});
  }

  replace({text, filters, offset, limit}: Partial<KgNodeSearchVariables>) {
    return new QueryStringKgNodeSearchVariables(
      text !== undefined ? text : this.text,
      filters !== undefined ? filters : this.filters,
      offset !== undefined ? offset : this.offset,
      limit !== undefined ? limit : this.limit
    );
  }
}

const makeTitle = (kwds: {
  text: string;
  count: number;
  filters?: KgNodeFilters;
  sources: KgSource[];
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
  const history = useHistory();

  const location = useLocation();

  const searchVariables = QueryStringKgNodeSearchVariables.parse(
    location.search
  );

  const {data, loading, error} = useQuery<
    KgNodeSearchResultsPageQuery,
    KgNodeSearchResultsPageQueryVariables
  >(KgNodeSearchResultsPageQueryDocument, {
    variables: {
      initialQuery: true,
      kgId,
      limit: 10,
      offset: 0,
      text: searchVariables.text,
    },
  });

  const apolloClient = useApolloClient();

  const [nodes, setNodes] = React.useState<KgNode[] | null>(null);

  const tableUpdateQuery = (
    newSearchVariables: QueryStringKgNodeSearchVariables
  ) => {
    apolloClient
      .query<
        KgNodeSearchResultsPageQuery,
        KgNodeSearchResultsPageQueryVariables
      >({
        query: KgNodeSearchResultsPageQueryDocument,
        variables: {
          kgId,
          ...newSearchVariables.object,
          initialQuery: false,
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
          history.push(newSearchVariables.stringify());
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
                  text: searchVariables.text,
                  count,
                  filters: searchVariables.filters,
                  sources,
                })}
                nodes={nodes ?? initialNodes}
                rowsPerPage={searchVariables.limit}
                count={count}
                page={searchVariables.page}
                onChangePage={(newPage: number) =>
                  tableUpdateQuery(
                    searchVariables.replace({
                      offset: newPage * searchVariables.limit,
                    })
                  )
                }
                onChangeRowsPerPage={(newRowsPerPage: number) =>
                  tableUpdateQuery(
                    searchVariables.replace({
                      offset: 0,
                      limit: newRowsPerPage,
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
