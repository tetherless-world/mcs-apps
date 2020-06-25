import * as React from "react";
import {Frame} from "components/frame/Frame";
import {useParams} from "react-router-dom";
import * as BenchmarkDatasetPageQueryDocument from "api/queries/benchmark/BenchmarkDatasetPageQuery.graphql";
import {useQuery} from "@apollo/react-hooks";
import {Card, CardContent, CardHeader, Grid} from "@material-ui/core";
import {BenchmarkSubmissionsTable} from "components/benchmark/BenchmarkSubmissionsTable";
import {BenchmarkDatasetPageQuery} from "api/queries/benchmark/types/BenchmarkDatasetPageQuery";
import {NotFound} from "components/error/NotFound";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import * as _ from "lodash";

export const BenchmarkDatasetPage: React.FunctionComponent = () => {
  const {benchmarkId, datasetId} = _.mapValues(
    useParams<{
      benchmarkId: string;
      datasetId: string;
    }>(),
    decodeURIComponent
  );

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
          <BenchmarkFrame
            title={dataset.name}
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
              dataset: {id: datasetId, name: dataset.name},
            }}
          >
            <Grid container direction="column">
              {dataset.submissions.length > 0 ? (
                <Grid item container>
                  <Grid item xs={6}>
                    <Card>
                      <CardHeader title="Submissions" />
                      <CardContent>
                        <BenchmarkSubmissionsTable
                          benchmarkSubmissions={dataset.submissions.map(
                            (submission) => ({
                              ...submission,
                              benchmarkId,
                              datasetId,
                            })
                          )}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : null}
            </Grid>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
