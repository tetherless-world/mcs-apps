import * as React from "react";
import {Grid, Typography} from "@material-ui/core";
import {Frame} from "components/frame/Frame";

import {useQuery} from "@apollo/react-hooks";
import {
  NodeSearchResultsPageQuery,
  NodeSearchResultsPageQueryVariables,
} from "api/queries/types/NodeSearchResultsPageQuery";
import * as NodeSearchResultsPageQueryDocument from "api/queries/NodeSearchResultsPageQuery.graphql";
import {NodeTable} from "components/data/NodeTable";

import * as ReactLoader from "react-loader";
import {useLocation, useHistory} from "react-router-dom";
import * as qs from "qs";
import {NodeFilters} from "api/graphqlGlobalTypes";
import {NodeSearchVariables} from "models/NodeSearchVariables";
import {ApolloErrorHandler} from "../error/ApolloErrorHandler";

class QueryStringNodeSearchVariables implements NodeSearchVariables {
  public readonly __typename = "NodeSearchVariables";

  private constructor(
    public readonly text: string,
    public readonly filters: NodeFilters = {datasource: null},
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
      filters: NodeFilters;
      offset: string;
      limit: string;
    };
    return new QueryStringNodeSearchVariables(
      text,
      filters,
      offset === undefined ? undefined : +offset,
      limit === undefined ? undefined : +limit
    );
  }

  stringify() {
    return qs.stringify(this.object, {addQueryPrefix: true});
  }

  replace({text, filters, offset, limit}: Partial<NodeSearchVariables>) {
    return new QueryStringNodeSearchVariables(
      text !== undefined ? text : this.text,
      filters !== undefined ? filters : this.filters,
      offset !== undefined ? offset : this.offset,
      limit !== undefined ? limit : this.limit
    );
  }
}

export const NodeSearchResultsPage: React.FunctionComponent<{}> = ({}) => {
  const history = useHistory();

  const location = useLocation();

  const searchVariables = QueryStringNodeSearchVariables.parse(location.search);

  const [count, setCount] = React.useState<number | null>(null);

  const {data, loading, error} = useQuery<
    NodeSearchResultsPageQuery,
    NodeSearchResultsPageQueryVariables
  >(NodeSearchResultsPageQueryDocument, {
    variables: {...searchVariables.object, withCount: count === null},
  });

  if (error) {
    return <ApolloErrorHandler error={error} />;
  }

  if (loading && count !== null) {
    setCount(null);
  }

  if (data?.matchingNodesCount && count === null) {
    setCount(data.matchingNodesCount);
  }

  return (
    <Frame>
      <Grid container spacing={3}>
        <Grid item md={8} data-cy="visualizationContainer">
          <ReactLoader loaded={!loading}>
            <Typography variant="h6">
              {count || "No"} results for "{searchVariables.text}"
            </Typography>
            {count && (
              <NodeTable
                nodes={data?.matchingNodes || []}
                rowsPerPage={searchVariables.limit}
                count={count}
                page={searchVariables.page}
                onChangePage={(newPage: number) =>
                  history.push(
                    searchVariables
                      .replace({offset: newPage * searchVariables.limit})
                      .stringify()
                  )
                }
                onChangeRowsPerPage={(newRowsPerPage: number) =>
                  history.push(
                    searchVariables
                      .replace({offset: 0, limit: newRowsPerPage})
                      .stringify()
                  )
                }
              />
            )}
          </ReactLoader>
        </Grid>
        {/* <Grid item xs={4} container direction="column">
          <Grid item>Extra information</Grid>
        </Grid> */}
      </Grid>
    </Frame>
  );
};
