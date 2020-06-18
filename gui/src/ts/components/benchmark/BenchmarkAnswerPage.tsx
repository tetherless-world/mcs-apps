import * as React from "react";
import {Frame} from "components/frame/Frame";
import {useParams, Link} from "react-router-dom";
import * as BenchmarkAnswerPageQueryDocument from "api/queries/benchmark/BenchmarkAnswerPageQuery.graphql";
import {
  BenchmarkAnswerPageQuery,
  BenchmarkAnswerPageQueryVariables,
  BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_choices as QuestionAnswerChoice,
} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";
import {useQuery} from "@apollo/react-hooks";
import * as _ from "lodash";
import * as ReactLoader from "react-loader";
import {ApolloException} from "@tetherless-world/twxplore-base";
import {FatalErrorModal} from "components/error/FatalErrorModal";
import {
  Grid,
  Breadcrumbs,
  Typography,
  Card,
  CardContent,
} from "@material-ui/core";
import {Hrefs} from "Hrefs";

//localhost:9001/benchmark/benchmark0/dataset/benchmark0-test/submission/benchmark0-submission/question/benchmark0-test-0

interface BenchmarkPathParams {
  benchmarkId: string;
  datasetId: string;
  submissionId: string;
  questionId: string;
}

const BenchmarkBreadcrumbs: React.FunctionComponent<Partial<
  BenchmarkPathParams
>> = ({benchmarkId, datasetId, submissionId, questionId}) => {
  const breadcrumbsChildren: React.ReactNode = (() => {
    const breadcrumbs: React.ReactNodeArray = [
      <Link to={Hrefs.benchmarks}>Benchmarks</Link>,
    ];

    if (!benchmarkId) {
      return breadcrumbs;
    }

    const benchmark = Hrefs.benchmark({id: benchmarkId});
    breadcrumbs.push(<Link to={benchmark.home}>{benchmarkId}</Link>);

    if (!datasetId) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography>Datasets</Typography>);

    const dataset = benchmark.dataset({id: datasetId});
    breadcrumbs.push(<Link to={dataset.home}>{datasetId}</Link>);

    if (!submissionId) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography>Submissions</Typography>);

    const submission = dataset.submission({id: submissionId});
    breadcrumbs.push(<Link to={submission.home}>{submissionId}</Link>);

    if (!questionId) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography>Questions</Typography>);

    breadcrumbs.push(
      <Link to={submission.question({id: questionId})}>{questionId}</Link>
    );

    return breadcrumbs;
  })();

  return <Breadcrumbs>{breadcrumbsChildren}</Breadcrumbs>;
};

const NotFound: React.FunctionComponent<{label: string}> = ({label}) => {
  return (
    <Frame>
      <Typography variant="h5">{label} was not found</Typography>
    </Frame>
  );
};

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

export const BenchmarkAnswerPage: React.FunctionComponent = () => {
  const variables = _.mapValues(
    useParams<BenchmarkPathParams>(),
    decodeURIComponent
  );
  const {benchmarkId, datasetId, submissionId, questionId} = variables;

  const {data, error, loading} = useQuery<
    BenchmarkAnswerPageQuery,
    BenchmarkAnswerPageQueryVariables
  >(BenchmarkAnswerPageQueryDocument, {variables});

  if (error) {
    return <FatalErrorModal exception={new ApolloException(error)} />;
  } else if (loading) {
    return (
      <Frame>
        <ReactLoader loaded={false} />
      </Frame>
    );
  } else if (!data) {
    throw new EvalError();
  }

  const benchmark = data.benchmarkById;
  if (!benchmark) {
    return <NotFound label={benchmarkId} />;
  }

  const dataset = benchmark.datasetById;
  if (!dataset) {
    return <NotFound label={datasetId} />;
  }

  const question = dataset.questionById;
  if (!question) {
    return <NotFound label={questionId} />;
  }

  const submission = dataset.submissionById;
  if (!submission) {
    return <NotFound label={submissionId} />;
  }

  const answer = submission.answerByQuestionId;
  if (!answer) {
    return <NotFound label={`Answer for ${questionId} `} />;
  }

  // console.log(JSON.stringify(data));

  return (
    <Frame>
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <BenchmarkBreadcrumbs {...variables} />
        </Grid>

        {/* Show question and answer choices*/}
        <Grid item container spacing={2}>
          <Grid item md={6} container direction="column" justify="center">
            <Grid item>
              <Typography variant="h4">{question.text}</Typography>
            </Grid>
          </Grid>
          <Grid item md={6} container direction="column" spacing={3}>
            {question.choices.map((choice) => (
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
                question.choices.find(
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
      </Grid>
    </Frame>
  );
};
