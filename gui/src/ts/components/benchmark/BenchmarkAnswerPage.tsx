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
import {
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import {NotFound} from "components/error/NotFound";
import {Frame} from "components/frame/Frame";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import {faStar, faTimes, faCheck} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {BenchmarkAnswerChoiceAnalysisGraph} from "components/benchmark/BenchmarkAnswerChoiceAnalysisGraph";

// http://localhost:9001/benchmark/benchmark0/dataset/benchmark0-test/submission/benchmark0-submission/question/benchmark0-test-0

// http://localhost:9001/benchmark/commonsenseqa/dataset/commonsenseqa-dev/submission/kagnet-commonsenseqa-dev/question/commonsenseqa-dev-1afa02df02c908a558b4036e80242fac

const CorrectSubmissionAnswerIcon = (
  <FontAwesomeIcon
    icon={faCheck}
    color="green"
    size="2x"
    data-cy="correctSubmissionAnswerIcon"
  />
);
const CorrectChoiceIcon = (
  <FontAwesomeIcon
    icon={faStar}
    color="purple"
    size="2x"
    data-cy="correctChoiceIcon"
  />
);
const SubmissionChoiceIcon = (
  <FontAwesomeIcon
    icon={faTimes}
    color="red"
    size="2x"
    data-cy="submissionChoiceIcon"
  />
);

const QuestionAnswerChoiceCard: React.FunctionComponent<{
  choice: QuestionAnswerChoice;
  dataCy: string;
  isCorrectChoice?: boolean;
  isSubmissionChoice?: boolean;
}> = ({choice, children, dataCy, isCorrectChoice, isSubmissionChoice}) => {
  let icon = null;

  if (isCorrectChoice && isSubmissionChoice) {
    icon = CorrectSubmissionAnswerIcon;
  } else if (isCorrectChoice) {
    icon = CorrectChoiceIcon;
  } else if (isSubmissionChoice) {
    icon = SubmissionChoiceIcon;
  }

  return (
    <Card data-cy={dataCy}>
      <CardContent>
        <Grid container>
          <Grid item xs={2}>
            {icon}
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h6" data-cy="label">
              {choice.label}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body1" data-cy="text">
              {choice.text}
            </Typography>
          </Grid>
        </Grid>
        {children}
      </CardContent>
    </Card>
  );
};

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

        const explanation = answer?.explanation;
        const choiceAnalyses = explanation?.choiceAnalyses;

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
              <Grid item>
                <List
                  style={{display: "flex", flexDirection: "row", padding: 0}}
                >
                  <ListItem>
                    <ListItemAvatar>
                      {CorrectSubmissionAnswerIcon}
                    </ListItemAvatar>
                    <ListItemText primary="Submission answered correctly" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>{SubmissionChoiceIcon}</ListItemAvatar>
                    <ListItemText primary="Submission answered incorrectly" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>{CorrectChoiceIcon}</ListItemAvatar>
                    <ListItemText primary="Correct answer to question" />
                  </ListItem>
                </List>
              </Grid>

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
                        isSubmissionChoice={
                          answer?.choiceLabel === choice.label
                        }
                        isCorrectChoice={
                          question.correctChoiceLabel === choice.label
                        }
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
              {choiceAnalyses?.map((choiceAnalysis) => (
                <Grid item key={choiceAnalysis.choiceLabel}>
                  <BenchmarkAnswerChoiceAnalysisGraph
                    choiceAnalysis={choiceAnalysis}
                  />
                </Grid>
              ))}
            </Grid>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
