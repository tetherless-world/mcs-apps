import * as React from "react";
import {BenchmarkFrame} from "benchmark/components/frame/BenchmarkFrame";
import {useParams} from "react-router-dom";
import * as BenchmarkDatasetPageQueryDocument from "benchmark/api/queries/BenchmarkDatasetPageQuery.graphql";
import {useApolloClient, useQuery} from "@apollo/react-hooks";
import {Card, CardContent, CardHeader, Grid} from "@material-ui/core";
import {BenchmarkSubmissionsTable} from "benchmark/components/benchmark/BenchmarkSubmissionsTable";
import {BenchmarkDatasetPageQuery} from "benchmark/api/queries/types/BenchmarkDatasetPageQuery";
import {NotFound} from "shared/components/error/NotFound";
import {BenchmarkBreadcrumbsFrame} from "benchmark/components/frame/BenchmarkBreadcrumbsFrame";
import * as _ from "lodash";
import {BenchmarkQuestionsTable} from "benchmark/components/benchmark/BenchmarkQuestionsTable";
import {
  BenchmarkDatasetQuestionsPaginationQuery,
  BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById_questions,
  BenchmarkDatasetQuestionsPaginationQueryVariables,
} from "benchmark/api/queries/types/BenchmarkDatasetQuestionsPaginationQuery";
import * as BenchmarkDatasetQuestionsPaginationQueryDocument from "benchmark/api/queries/BenchmarkDatasetQuestionsPaginationQuery.graphql";

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

  const apolloClient = useApolloClient();

  const [questions, setQuestions] = React.useState<
    | BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById_questions[]
    | null
  >(null);

  return (
    <BenchmarkFrame {...query}>
      {({data: initialData}) => {
        const benchmark = initialData.benchmarkById;
        if (!benchmark) {
          return <NotFound label={benchmarkId} />;
        }
        const dataset = benchmark.datasetById;
        if (!dataset) {
          return <NotFound label={datasetId} />;
        }
        if (questions === null) {
          setQuestions(dataset.questions);
          return null;
        }

        return (
          <BenchmarkBreadcrumbsFrame
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
                  onChangePage={({limit, offset}) => {
                    // Use another query to paginate instead of refetch so that we don't re-render the whole frame when loading goes back to true.
                    // We also don't request redundant data.
                    apolloClient
                      .query<
                        BenchmarkDatasetQuestionsPaginationQuery,
                        BenchmarkDatasetQuestionsPaginationQueryVariables
                      >({
                        query: BenchmarkDatasetQuestionsPaginationQueryDocument,
                        variables: {
                          benchmarkId,
                          datasetId,
                          questionsLimit: limit,
                          questionsOffset: offset,
                        },
                      })
                      .then(({data, errors, loading}) => {
                        if (errors) {
                        } else if (loading) {
                        } else if (!data) {
                          throw new EvalError();
                        }
                        setQuestions(
                          data.benchmarkById!.datasetById!.questions
                        );
                      });
                  }}
                  questions={questions}
                  questionsTotal={dataset.questionsCount}
                  submissions={dataset.submissions.map((submission) => ({
                    benchmarkId,
                    datasetId,
                    ...submission,
                  }))}
                />
              </Grid>
            </Grid>
          </BenchmarkBreadcrumbsFrame>
        );
      }}
    </BenchmarkFrame>
  );
};
