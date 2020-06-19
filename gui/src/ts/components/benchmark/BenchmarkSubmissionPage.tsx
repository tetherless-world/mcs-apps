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

const QUESTIONS_PER_PAGE = 10;

export const BenchmarkSubmissionPage: React.FunctionComponent = () => {
  const {benchmarkId, datasetId, submissionId} = useParams<{
    benchmarkId: string;
    datasetId: string;
    submissionId: string;
  }>();

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
                  name: "text",
                  label: "Text",
                  options: {
                    customBodyRender: (value, tableMeta) => {
                      return (
                        <Link
                          to={Hrefs.benchmark({id: benchmarkId})
                            .dataset({id: datasetId})
                            .submission({id: submissionId})
                            .question({id: tableMeta.rowData[2]})}
                        >
                          {value}
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
                count: dataset.questionCount,
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
