import * as React from "react";
import {Frame} from "components/frame/Frame";
import {useParams} from "react-router-dom";
import * as BenchmarkDatasetPageQueryDocument from "api/queries/benchmark/BenchmarkDatasetPageQuery.graphql";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import {useQuery} from "@apollo/react-hooks";
import * as ReactLoader from "react-loader";
import {Grid, Typography} from "@material-ui/core";
import {BenchmarkSubmissionsTable} from "components/benchmark/BenchmarkSubmissionsTable";
import {BenchmarkDatasetPageQuery} from "api/queries/benchmark/types/BenchmarkDatasetPageQuery";

export const BenchmarkDatasetPage: React.FunctionComponent = () => {
  const {benchmarkId, datasetId} = useParams<{
    benchmarkId: string;
    datasetId: string;
  }>();

  const {data, error, loading} = useQuery<BenchmarkDatasetPageQuery>(
    BenchmarkDatasetPageQueryDocument,
    {variables: {benchmarkId, datasetId}}
  );

  if (error) {
    return <ApolloErrorHandler error={error} />;
  } else if (loading) {
    return (
      <Frame>
        <ReactLoader loaded={false} />
      </Frame>
    );
  } else if (!data) {
    throw new EvalError();
  }

  const benchmark = data.benchmarkById;
  if (!benchmark) {
    return (
      <Frame>
        <h3>
          <code>{benchmarkId} not found</code>
        </h3>
      </Frame>
    );
  }
  const dataset = benchmark.datasetById;
  if (!dataset) {
    return (
      <Frame>
        <h3>
          <code>{datasetId} not found</code>
        </h3>
      </Frame>
    );
  }

  return (
    <Frame>
      <Grid container direction="column" spacing={6}>
        <Grid item>
          <Typography data-cy="dataset-name" variant="h4">
            {dataset.name}
          </Typography>
        </Grid>
        {dataset.submissions.length > 0 ? (
          <Grid item>
            <Typography variant="h5">Submissions</Typography>
            <BenchmarkSubmissionsTable
              benchmarkSubmissions={dataset.submissions.map((submission) => ({
                ...submission,
                benchmarkId,
                datasetId,
              }))}
            />
          </Grid>
        ) : null}
      </Grid>
    </Frame>
  );
};
