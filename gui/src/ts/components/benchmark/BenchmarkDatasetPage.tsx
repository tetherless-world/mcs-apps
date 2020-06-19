import * as React from "react";
import {Frame} from "components/frame/Frame";
import {useParams} from "react-router-dom";
import * as BenchmarkDatasetPageQueryDocument from "api/queries/benchmark/BenchmarkDatasetPageQuery.graphql";
import {useQuery} from "@apollo/react-hooks";
import {Grid, Typography} from "@material-ui/core";
import {BenchmarkSubmissionsTable} from "components/benchmark/BenchmarkSubmissionsTable";
import {BenchmarkDatasetPageQuery} from "api/queries/benchmark/types/BenchmarkDatasetPageQuery";
import {NotFound} from "components/error/NotFound";

export const BenchmarkDatasetPage: React.FunctionComponent = () => {
  const {benchmarkId, datasetId} = useParams<{
    benchmarkId: string;
    datasetId: string;
  }>();

  const query = useQuery<BenchmarkDatasetPageQuery>(
    BenchmarkDatasetPageQueryDocument,
    {variables: {benchmarkId, datasetId}}
  );

  return (
    <Frame {...query}>
      {({data}) => {
        const benchmark = data.benchmarkById;
        if (!benchmark) {
          return <NotFound label={benchmarkId} />;
        }
        const dataset = benchmark.datasetById;
        if (!dataset) {
          return <NotFound label={datasetId} />;
        }

        return (
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
                  benchmarkSubmissions={dataset.submissions.map(
                    (submission) => ({
                      ...submission,
                      benchmarkId,
                      datasetId,
                    })
                  )}
                />
              </Grid>
            ) : null}
          </Grid>
        );
      }}
    </Frame>
  );
};
