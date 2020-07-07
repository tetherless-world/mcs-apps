import * as React from "react";
import {useParams} from "react-router-dom";
import {useApolloClient, useQuery} from "@apollo/react-hooks";
import * as BenchmarkSubmissionPageQueryDocument from "benchmark/api/queries/BenchmarkSubmissionPageQuery.graphql";
import {BenchmarkSubmissionPageQuery} from "benchmark/api/queries/types/BenchmarkSubmissionPageQuery";
import {Frame} from "benchmark/components/frame/Frame";
import {NotFound} from "shared/components/error/NotFound";
import {BenchmarkFrame} from "benchmark/components/benchmark/BenchmarkFrame";
import * as _ from "lodash";
import {BenchmarkQuestionsTable} from "benchmark/components/benchmark/BenchmarkQuestionsTable";
import {
  BenchmarkSubmissionQuestionsPaginationQuery,
  BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions,
  BenchmarkSubmissionQuestionsPaginationQueryVariables,
} from "benchmark/api/queries/types/BenchmarkSubmissionQuestionsPaginationQuery";
import * as BenchmarkSubmissionQuestionsPaginationQueryDocument from "benchmark/api/queries/BenchmarkSubmissionQuestionsPaginationQuery.graphql";

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

  const initialQuery = useQuery<BenchmarkSubmissionPageQuery>(
    BenchmarkSubmissionPageQueryDocument,
    {
      variables: {
        benchmarkId,
        datasetId,
        questionsLimit: QUESTIONS_PER_PAGE,
        questionsOffset: 0,
        submissionId,
      },
    }
  );

  const apolloClient = useApolloClient();

  const [questions, setQuestions] = React.useState<
    | BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions[]
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
                    BenchmarkSubmissionQuestionsPaginationQuery,
                    BenchmarkSubmissionQuestionsPaginationQueryVariables
                  >({
                    query: BenchmarkSubmissionQuestionsPaginationQueryDocument,
                    variables: {
                      benchmarkId,
                      datasetId,
                      questionsLimit: limit,
                      questionsOffset: offset,
                      submissionId,
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
              questions={questions.map((question) => {
                const {answerBySubmissionId, ...questionProps} = question;
                if (!answerBySubmissionId) {
                  return questionProps;
                }
                return {
                  answers: [{submissionId, ...answerBySubmissionId}],
                  ...questionProps,
                };
              })}
              questionsTotal={dataset.questionsCount}
              submissions={[
                {benchmarkId, datasetId, id: submissionId, ...submission},
              ]}
              submissionId={submissionId}
            />
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
