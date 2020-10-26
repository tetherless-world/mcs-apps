import * as React from "react";
import {
  Breadcrumbs,
  Chip,
  emphasize,
  Typography,
  withStyles,
} from "@material-ui/core";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import HomeIcon from "@material-ui/icons/Home";
import ExtensionIcon from "@material-ui/icons/Extension";
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer";
import DoneIcon from "@material-ui/icons/Done";
import ShutterSpeedIcon from "@material-ui/icons/ShutterSpeed";
import {BenchmarkBreadcrumbsProps} from "benchmark/components/frame/BenchmarkBreadcrumbsProps";
import {BenchmarkHrefsContext} from "benchmark/BenchmarkHrefsContext";

const StyledBreadcrumb = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[100],
    height: theme.spacing(3),
    color: theme.palette.grey[800],
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.grey[300],
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12),
    },
  },
}))(Chip) as any; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

export const BenchmarkBreadcrumbs: React.FunctionComponent<BenchmarkBreadcrumbsProps> = ({
  benchmark,
  dataset,
  question,
  submission,
}) => {
  const hrefs = React.useContext<BenchmarkHrefs>(BenchmarkHrefsContext);

  const breadcrumbsChildren: React.ReactNode = (() => {
    const breadcrumbs: React.ReactNodeArray = [
      <StyledBreadcrumb
        component="a"
        data-cy="benchmarks"
        href={hrefs.benchmarks}
        icon={<HomeIcon />}
        key="benchmarks"
        label="Benchmarks"
      ></StyledBreadcrumb>,
    ];

    if (!benchmark) {
      return breadcrumbs;
    }

    const benchmarkHrefs = hrefs.benchmark({id: benchmark.id});
    breadcrumbs.push(
      <StyledBreadcrumb
        component="a"
        data-cy="benchmark"
        href={benchmarkHrefs.home}
        icon={<ShutterSpeedIcon />}
        key={"benchmark-" + benchmark.id}
        label={benchmark.name}
      ></StyledBreadcrumb>
    );

    if (!dataset) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography key="datasets">Datasets</Typography>);

    const datasetHrefs = benchmarkHrefs.dataset({id: dataset.id});
    breadcrumbs.push(
      <StyledBreadcrumb
        component="a"
        data-cy="dataset"
        key={"dataset-" + dataset.id}
        href={datasetHrefs.home}
        icon={<ExtensionIcon />}
        label={dataset.name}
      ></StyledBreadcrumb>
    );

    if (!submission) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography key="submissions">Submissions</Typography>);

    const submissionHrefs = datasetHrefs.submission({id: submission.id});
    breadcrumbs.push(
      <StyledBreadcrumb
        component="a"
        key={"submission-" + submission.id}
        href={submissionHrefs.home}
        icon={<DoneIcon />}
        data-cy="submission"
        label={submission.name}
      ></StyledBreadcrumb>
    );

    if (!question) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography key="questions">Questions</Typography>);

    breadcrumbs.push(
      <StyledBreadcrumb
        component="a"
        data-cy="question"
        key={"question-" + question.id}
        href={submissionHrefs.question({id: question.id})}
        icon={<QuestionAnswerIcon />}
        label={question.id}
      ></StyledBreadcrumb>
    );

    return breadcrumbs;
  })();

  return <Breadcrumbs data-cy="breadcrumbs">{breadcrumbsChildren}</Breadcrumbs>;
};
