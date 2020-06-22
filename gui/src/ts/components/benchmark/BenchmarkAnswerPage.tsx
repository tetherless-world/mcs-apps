import * as React from "react";
import {useParams} from "react-router-dom";
import * as BenchmarkAnswerPageQueryDocument from "api/queries/benchmark/BenchmarkAnswerPageQuery.graphql";
import {
  BenchmarkAnswerPageQuery,
  BenchmarkAnswerPageQueryVariables,
  BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_choices as QuestionAnswerChoice,
} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";
import {useQuery} from "@apollo/react-hooks";
import * as _ from "lodash";
import {Grid, Typography, Card, CardContent} from "@material-ui/core";
import {NotFound} from "components/error/NotFound";
import {Frame} from "components/frame/Frame";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import {BenchmarkAnswerExplanationGraph} from "components/benchmark/BenchmarkAnswerExplanationGraph";

//localhost:9001/benchmark/benchmark0/dataset/benchmark0-test/submission/benchmark0-submission/question/benchmark0-test-0

const QuestionAnswerChoiceCard: React.FunctionComponent<{
  choice: QuestionAnswerChoice;
  dataCy: string;
}> = ({choice, children, dataCy}) => (
  <Card data-cy={dataCy}>
    <CardContent>
      <Grid container>
        <Grid item xs={2}>
          <Typography variant="h6" data-cy="label">
            {choice.label}
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="body1" data-cy="text">
            {choice.text}
          </Typography>
        </Grid>
      </Grid>
      {children}
    </CardContent>
  </Card>
);

interface BenchmarkAnswerRouteParams {
  benchmarkId: string;
  datasetId: string;
  submissionId: string;
  questionId: string;
}

export const BenchmarkAnswerPage: React.FunctionComponent = () => {
  const routeParams = _.mapValues(
    useParams<BenchmarkAnswerRouteParams>(),
    decodeURIComponent
  );

  const query = useQuery<
    BenchmarkAnswerPageQuery,
    BenchmarkAnswerPageQueryVariables
  >(BenchmarkAnswerPageQueryDocument, {
    variables: routeParams,
  });

  return (
    <Frame {...query}>
      {({data}) => {
        const benchmark = data.benchmarkById;
        const dataset = benchmark?.datasetById;
        const question = dataset?.questionById;
        const submission = dataset?.submissionById;
        const answer = submission?.answerByQuestionId;

        const {benchmarkId, datasetId, submissionId, questionId} = routeParams;

        if (!benchmark) {
          return <NotFound label={benchmarkId} />;
        }

        if (!dataset) {
          return <NotFound label={datasetId} />;
        }

        if (!question) {
          return <NotFound label={questionId} />;
        }

        if (!submission) {
          return <NotFound label={submissionId} />;
        }

        return (
          <BenchmarkFrame
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
              dataset: {id: datasetId, name: dataset.name},
              question: {id: questionId},
              submission: {id: submissionId, name: submission.name},
            }}
          >
            {/* Show question and answer choices*/}
            <Grid container direction="column">
              <Grid item container>
                <Grid item md={6} container direction="column" justify="center">
                  <Grid item>
                    <Typography variant="h4" data-cy="questionText">
                      {question.text}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item md={6} container direction="column" spacing={3}>
                  {question.choices.map((choice) => (
                    <Grid item key={choice.label}>
                      <QuestionAnswerChoiceCard
                        choice={choice}
                        dataCy="questionAnswer"
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Extra spacing hack */}
              <Grid item>
                <br />
                <br />
              </Grid>

              {answer && (
                <React.Fragment>
                  {/* Show submission answer */}
                  <Grid item container spacing={2}>
                    <Grid
                      item
                      md={6}
                      container
                      direction="column"
                      justify="center"
                      alignItems="flex-end"
                    >
                      <Grid item>
                        <Typography variant="h5">
                          Submission{" "}
                          <span data-cy="submissionId">{submissionId}</span>{" "}
                          answered
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item md={6} spacing={3}>
                      <QuestionAnswerChoiceCard
                        choice={
                          question.choices.find(
                            (choice) => choice.label === answer.choiceLabel
                          )!
                        }
                        dataCy="submissionAnswer"
                      ></QuestionAnswerChoiceCard>
                    </Grid>
                  </Grid>

                  {/* Show submission explanation */}
                  {answer.explanation && (
                    <Grid item>
                      <BenchmarkAnswerExplanationGraph
                        explanation={answer.explanation}
                      />
                    </Grid>
                  )}
                </React.Fragment>
              )}
            </Grid>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
