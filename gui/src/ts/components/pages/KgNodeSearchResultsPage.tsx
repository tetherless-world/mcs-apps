import * as React from "react";
import {Grid, Typography} from "@material-ui/core";
import {Frame} from "components/frame/Frame";

import {useQuery} from "@apollo/react-hooks";
import {
  KgNodeSearchResultsPageQuery,
  KgNodeSearchResultsPageQueryVariables,
} from "api/queries/types/KgNodeSearchResultsPageQuery";
import * as KgNodeSearchResultsPageQueryDocument from "api/queries/KgNodeSearchResultsPageQuery.graphql";
import {KgNodeTable} from "components/kg/KgNodeTable";

import * as ReactLoader from "react-loader";
import {useLocation, useHistory} from "react-router-dom";
import * as qs from "qs";
import {KgNodeFilters} from "api/graphqlGlobalTypes";
import {KgNodeSearchVariables} from "models/kg/KgNodeSearchVariables";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import {kgId} from "api/kgId";

class QueryStringKgNodeSearchVariables implements KgNodeSearchVariables {
  public readonly __typename = "KgNodeSearchVariables";

  private constructor(
    public readonly text: string,
    public readonly filters: KgNodeFilters = {datasource: null},
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
      filters: KgNodeFilters;
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

export const KgNodeSearchResultsPage: React.FunctionComponent<{}> = ({}) => {
  const history = useHistory();

  const location = useLocation();

  const searchVariables = QueryStringKgNodeSearchVariables.parse(
    location.search
  );

  const [count, setCount] = React.useState<number | null>(null);

  const {data, loading, error} = useQuery<
    KgNodeSearchResultsPageQuery,
    KgNodeSearchResultsPageQueryVariables
  >(KgNodeSearchResultsPageQueryDocument, {
    variables: {kgId, ...searchVariables.object, withCount: count === null},
  });

  if (error) {
    return <ApolloErrorHandler error={error} />;
  }

  if (loading && count !== null) {
    setCount(null);
  }

  if (data?.kg.matchingNodesCount && count === null) {
    setCount(data.kg.matchingNodesCount);
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
              <KgNodeTable
                nodes={data?.kg.matchingNodes || []}
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
