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
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import {NotFound} from "components/error/NotFound";

//localhost:9001/benchmark/benchmark0/dataset/benchmark0-test/submission/benchmark0-submission/question/benchmark0-test-0

const QuestionAnswerChoiceCard: React.FunctionComponent<{
  choice: QuestionAnswerChoice;
}> = ({choice, children}) => (
  <Card>
    <CardContent>
      <Grid container>
        <Grid item xs={2}>
          <Typography variant="h6">{choice.label}</Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="body1">{choice.text}</Typography>
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
  const {submissionId, questionId} = routeParams;

  const {data, error, loading} = useQuery<
    BenchmarkAnswerPageQuery,
    BenchmarkAnswerPageQueryVariables
  >(BenchmarkAnswerPageQueryDocument, {variables: routeParams});

  const benchmark = data?.benchmarkById;
  const dataset = benchmark?.datasetById;
  const question = dataset?.questionById;
  const submission = dataset?.submissionById;
  const answer = submission?.answerByQuestionId;

  return (
    <BenchmarkFrame
      routeParams={routeParams}
      data={data}
      error={error}
      loading={loading}
    >
      <Grid container direction="column">
        {/* Show question and answer choices*/}
        <Grid item container>
          <Grid item md={6} container direction="column" justify="center">
            <Grid item>
              <Typography variant="h4">{question?.text}</Typography>
            </Grid>
          </Grid>
          <Grid item md={6} container direction="column" spacing={3}>
            {question?.choices.map((choice) => (
              <Grid item key={choice.label}>
                <QuestionAnswerChoiceCard choice={choice} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Extra spacing hack */}
        <Grid item>
          <br />
          <br />
        </Grid>

        {!answer && <NotFound label={`Answer for ${questionId} `} />}
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
                    Submission {submissionId} answered
                  </Typography>
                </Grid>
              </Grid>
              <Grid item md={6} spacing={3}>
                <QuestionAnswerChoiceCard
                  choice={
                    question?.choices.find(
                      (choice) => choice.label === answer.choiceLabel
                    )!
                  }
                ></QuestionAnswerChoiceCard>
              </Grid>
            </Grid>

            {/* Show submission explanation */}
            <Grid item>
              <Typography variant="body1">Explanation</Typography>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    </BenchmarkFrame>
  );
};
