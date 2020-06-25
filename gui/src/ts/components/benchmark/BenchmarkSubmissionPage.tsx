import * as React from "react";
import {useParams} from "react-router-dom";
import {useApolloClient, useQuery} from "@apollo/react-hooks";
import * as BenchmarkDatasetQuestionPaginationQueryDocument from "api/queries/benchmark/BenchmarkDatasetQuestionPaginationQuery.graphql";
import * as BenchmarkSubmissionPageQueryDocument from "api/queries/benchmark/BenchmarkSubmissionPageQuery.graphql";
import {BenchmarkSubmissionPageQuery} from "api/queries/benchmark/types/BenchmarkSubmissionPageQuery";
import {Frame} from "components/frame/Frame";
import {NotFound} from "components/error/NotFound";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import {
  BenchmarkDatasetQuestionPaginationQuery,
  BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions,
  BenchmarkDatasetQuestionPaginationQueryVariables,
} from "api/queries/benchmark/types/BenchmarkDatasetQuestionPaginationQuery";
import * as _ from "lodash";
import {BenchmarkQuestionsTable} from "components/benchmark/BenchmarkQuestionsTable";

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

        return (
          <BenchmarkFrame
            title={submission.name}
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
              dataset: {id: datasetId, name: dataset.name},
              submission: {id: submissionId, name: submission.name},
            }}
          >
            <BenchmarkQuestionsTable
              benchmarkId={benchmarkId}
              datasetId={datasetId}
              onChangePage={({limit, offset}) => {
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
                      questionLimit: limit,
                      questionOffset: offset,
                    },
                  })
                  .then(({data, errors, loading}) => {
                    if (errors) {
                    } else if (loading) {
                    } else if (!data) {
                      throw new EvalError();
                    }
                    setQuestions(data.benchmarkById!.datasetById!.questions);
                  });
              }}
              questions={questions}
              questionsTotal={dataset.questionsCount}
              submissionId={submissionId}
            />
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
