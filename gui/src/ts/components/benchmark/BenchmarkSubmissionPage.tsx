import * as React from "react";
import {useParams, Link} from "react-router-dom";
import {useApolloClient, useQuery} from "@apollo/react-hooks";
import * as BenchmarkDatasetQuestionPaginationQueryDocument from "api/queries/benchmark/BenchmarkDatasetQuestionPaginationQuery.graphql";
import * as BenchmarkSubmissionPageQueryDocument from "api/queries/benchmark/BenchmarkSubmissionPageQuery.graphql";
import {BenchmarkSubmissionPageQuery} from "api/queries/benchmark/types/BenchmarkSubmissionPageQuery";
import {Frame} from "components/frame/Frame";
import {NotFound} from "components/error/NotFound";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import MUIDataTable from "mui-datatables";
import {Typography} from "@material-ui/core";
import {Hrefs} from "Hrefs";
import {
  BenchmarkDatasetQuestionPaginationQuery,
  BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions,
  BenchmarkDatasetQuestionPaginationQueryVariables,
} from "api/queries/benchmark/types/BenchmarkDatasetQuestionPaginationQuery";
import * as _ from "lodash";
import {BenchmarkQuestionText} from "components/benchmark/BenchmarkQuestionText";

const QUESTIONS_PER_PAGE = 10;

export const BenchmarkSubmissionPage: React.FunctionComponent = () => {
  const {benchmarkId, datasetId, submissionId} = _.mapValues(
    useParams<{
      benchmarkId: string;
      datasetId: string;
      submissionId: string;
    }>(),
    decodeURIComponent
  );

  const apolloClient = useApolloClient();

  const initialQuery = useQuery<BenchmarkSubmissionPageQuery>(
    BenchmarkSubmissionPageQueryDocument,
    {
      variables: {
        benchmarkId,
        datasetId,
        questionLimit: QUESTIONS_PER_PAGE,
        questionOffset: 0,
        submissionId,
      },
    }
  );

  const [questions, setQuestions] = React.useState<
    | BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions[]
    | null
  >(null);

  return (
    <Frame {...initialQuery}>
      {({data: initialData}) => {
        const benchmark = initialData.benchmarkById;
        if (!benchmark) {
          return <NotFound label={benchmarkId} />;
        }
        const dataset = benchmark.datasetById;
        if (!dataset) {
          return <NotFound label={datasetId} />;
        }
        const submission = dataset.submissionById;
        if (!submission) {
          return <NotFound label={submissionId} />;
        }
        if (questions === null) {
          setQuestions(dataset.questions);
          return null;
        }

        // See mui-datatables example
        // https://github.com/gregnb/mui-datatables/blob/master/examples/serverside-pagination/index.js

        const getRowQuestionId = (rowData: any[]) => rowData[2];

        return (
          <BenchmarkFrame
            title={submission.name}
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
              dataset: {id: datasetId, name: dataset.name},
              submission: {id: submissionId, name: submission.name},
            }}
          >
            <MUIDataTable
              columns={[
                {
                  name: "prompts",
                  label: "Text",
                  options: {
                    customBodyRender: (prompts, tableMeta) => {
                      return (
                        <Link
                          data-cy="question-text"
                          to={Hrefs.benchmark({id: benchmarkId})
                            .dataset({id: datasetId})
                            .submission({id: submissionId})
                            .question({
                              id: getRowQuestionId(tableMeta.rowData),
                            })}
                        >
                          <BenchmarkQuestionText prompts={prompts} />
                        </Link>
                      );
                    },
                  },
                },
                {name: "concept", label: "Concept"},
                {name: "id", label: "Id"},
              ]}
              data={questions}
              options={{
                count: dataset.questionsCount,
                filter: false,
                onTableChange: (action, tableState) => {
                  switch (action) {
                    case "changePage": {
                      // Use another query to paginate instead of refetch so that we don't re-render the whole frame when loading goes back to true.
                      // We also don't request redundant data.
                      apolloClient
                        .query<
                          BenchmarkDatasetQuestionPaginationQuery,
                          BenchmarkDatasetQuestionPaginationQueryVariables
                        >({
                          query: BenchmarkDatasetQuestionPaginationQueryDocument,
                          variables: {
                            benchmarkId,
                            datasetId,
                            questionLimit: tableState.rowsPerPage,
                            questionOffset:
                              tableState.page * tableState.rowsPerPage,
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
                      break;
                    }
                  }
                },
                rowsPerPage: QUESTIONS_PER_PAGE,
                serverSide: true,
                setRowProps: (row) => ({
                  "data-cy": "question-" + getRowQuestionId(row),
                }),
                sort: false,
              }}
              title={<Typography variant="h6">Questions</Typography>}
            />
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
