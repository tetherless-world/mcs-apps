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
import {BenchmarkQuestionsTable} from "components/benchmark/BenchmarkQuestionsTable";

const QUESTIONS_PER_PAGE = 10;

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
    {
      variables: {
        benchmarkId,
        datasetId,
        questionsLimit: QUESTIONS_PER_PAGE,
        questionsOffset: 0,
      },
    }
  );

  return (
    <Frame {...query}>
      {({data: initialData}) => {
        const benchmark = initialData.benchmarkById;
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
            <Grid container direction="column" spacing={6}>
              <Grid item container>
                <Grid item xs={6}>
                  <Card>
                    <CardHeader title="Submissions" />
                    <CardContent>
                      {dataset.submissions.length > 0 ? (
                        <BenchmarkSubmissionsTable
                          benchmarkSubmissions={dataset.submissions.map(
                            (submission) => ({
                              ...submission,
                              benchmarkId,
                              datasetId,
                            })
                          )}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Grid item>
                <BenchmarkQuestionsTable
                  benchmarkId={benchmarkId}
                  datasetId={datasetId}
                  initialQuestions={dataset.questions}
                  questionsTotal={dataset.questionsCount}
                />
              </Grid>
            </Grid>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
