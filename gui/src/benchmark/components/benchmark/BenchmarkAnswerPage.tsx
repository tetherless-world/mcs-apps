import * as React from "react";
import {useParams} from "react-router-dom";
import * as BenchmarkAnswerPageQueryDocument from "benchmark/api/queries/BenchmarkAnswerPageQuery.graphql";
import {
  BenchmarkAnswerPageQuery,
  BenchmarkAnswerPageQueryVariables,
  BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_choices as QuestionAnswerChoice,
} from "benchmark/api/queries/types/BenchmarkAnswerPageQuery";
import {useQuery} from "@apollo/react-hooks";
import * as _ from "lodash";
import {Grid, Typography, Card, CardContent, Divider} from "@material-ui/core";
import {NotFound} from "shared/components/error/NotFound";
import {BenchmarkFrame} from "benchmark/components/frame/BenchmarkFrame";
import {BenchmarkBreadcrumbsFrame} from "benchmark/components/frame/BenchmarkBreadcrumbsFrame";
import {faStar, faTimes, faCheck} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {BenchmarkAnswerChoiceAnalysisGraph} from "benchmark/components/benchmark/BenchmarkAnswerChoiceAnalysisGraph";
import {BenchmarkQuestionText} from "./BenchmarkQuestionText";

// http://localhost:9001/benchmark/benchmark0/dataset/benchmark0-test/submission/benchmark0-submission/question/benchmark0-test-0

// http://localhost:9001/benchmark/commonsenseqa/dataset/commonsenseqa-dev/submission/kagnet-commonsenseqa-dev/question/commonsenseqa-dev-1afa02df02c908a558b4036e80242fac

const CorrectSubmissionAnswerIcon = (
  <FontAwesomeIcon
    icon={faCheck}
    color="green"
    size="2x"
    style={{display: "inline", marginRight: "10px", marginBottom: "-10px"}}
    data-cy="correctSubmissionAnswerIcon"
  />
);
const CorrectChoiceIcon = (
  <FontAwesomeIcon
    icon={faStar}
    color="purple"
    size="2x"
    style={{display: "inline", marginRight: "10px", marginBottom: "-10px"}}
    data-cy="correctChoiceIcon"
  />
);
const SubmissionChoiceIcon = (
  <FontAwesomeIcon
    icon={faTimes}
    color="red"
    size="2x"
    style={{display: "inline", marginRight: "10px", marginBottom: "-10px"}}
    data-cy="submissionChoiceIcon"
  />
);

const QuestionAnswerChoiceCard: React.FunctionComponent<{
  choice: QuestionAnswerChoice;
  dataCy: string;
  isCorrectChoice?: boolean;
  isSubmissionChoice?: boolean;
}> = ({choice, dataCy, isCorrectChoice, isSubmissionChoice}) => {
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
      <CardContent style={{textAlign: "center"}}>
        {icon}
        <Typography variant="body1" style={{display: "inline"}} data-cy="text">
          {choice.text}
        </Typography>
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
    <BenchmarkFrame {...query}>
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
          <BenchmarkBreadcrumbsFrame
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
              dataset: {id: datasetId, name: dataset.name},
              question: {id: questionId},
              submission: {id: submissionId, name: submission.name},
            }}
          >
            {/* Show question and answer choices*/}
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <BenchmarkQuestionText
                  prompts={question.prompts}
                  questionStyle={{fontSize: "1.3rem", fontWeight: "bold"}}
                />
              </Grid>
              <Grid item container spacing={2}>
                {question.choices.map((choice) => (
                  <Grid item key={choice.id} md>
                    <QuestionAnswerChoiceCard
                      choice={choice}
                      dataCy={"question-answer-" + choice.id}
                      isSubmissionChoice={answer?.choiceId === choice.id}
                      isCorrectChoice={question.correctChoiceId === choice.id}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid item container justify="flex-end">
                <Grid item container spacing={4} style={{whiteSpace: "nowrap"}}>
                  <Grid item md>
                    <FontAwesomeIcon
                      icon={faCheck}
                      color="green"
                      size="1x"
                      style={{display: "inline"}}
                      data-cy="correctSubmissionAnswerIcon"
                    />{" "}
                    <Typography
                      variant="body2"
                      display="inline"
                      color="textSecondary"
                    >
                      Submission answered correctly
                    </Typography>
                  </Grid>
                  <Grid item md>
                    <FontAwesomeIcon
                      icon={faTimes}
                      color="red"
                      size="1x"
                      style={{display: "inline"}}
                      data-cy="submissionChoiceIcon"
                    />{" "}
                    <Typography
                      variant="body2"
                      display="inline"
                      color="textSecondary"
                    >
                      Submission answered incorrectly
                    </Typography>
                  </Grid>
                  <Grid item md>
                    <FontAwesomeIcon
                      icon={faStar}
                      color="purple"
                      size="1x"
                      style={{display: "inline"}}
                      data-cy="correctChoiceIcon"
                    />{" "}
                    <Typography
                      variant="body2"
                      display="inline"
                      color="textSecondary"
                    >
                      Correct answer to question
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {choiceAnalyses && (
                <>
                  {/* Extra spacing hack */}
                  <Grid item>
                    <br />
                    <br />
                  </Grid>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Typography variant="h6">
                      {submission.name} submission answer choice analyses
                    </Typography>
                  </Grid>

                  {choiceAnalyses.map((choiceAnalysis) => (
                    <Grid item key={choiceAnalysis.choiceId}>
                      <BenchmarkAnswerChoiceAnalysisGraph
                        choiceAnalysis={choiceAnalysis}
                        choices={question.choices}
                      />
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </BenchmarkBreadcrumbsFrame>
        );
      }}
    </BenchmarkFrame>
  );
};
