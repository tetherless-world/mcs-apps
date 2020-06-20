import * as React from "react";
import {Link} from "react-router-dom";
import {Breadcrumbs, Typography} from "@material-ui/core";
import {Hrefs} from "Hrefs";
import {BenchmarkBreadcrumbsProps} from "components/benchmark/BenchmarkBreadcrumbsProps";

export const BenchmarkBreadcrumbs: React.FunctionComponent<BenchmarkBreadcrumbsProps> = ({
  benchmark,
  dataset,
  question,
  submission,
}) => {
  const breadcrumbsChildren: React.ReactNode = (() => {
    const breadcrumbs: React.ReactNodeArray = [
      <Link key="benchmarks" to={Hrefs.benchmarks} data-cy="benchmarks">
        Benchmarks
      </Link>,
    ];

    if (!benchmark) {
      return breadcrumbs;
    }

    const benchmarkHrefs = Hrefs.benchmark({id: benchmark.id});
    breadcrumbs.push(
      <Link
        key={"benchmark-" + benchmark.id}
        to={benchmarkHrefs.home}
        data-cy="benchmark"
      >
        {benchmark.name}
      </Link>
    );

    if (!dataset) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography key="datasets">Datasets</Typography>);

    const datasetHrefs = benchmarkHrefs.dataset({id: dataset.id});
    breadcrumbs.push(
      <Link
        key={"dataset-" + dataset.id}
        to={datasetHrefs.home}
        data-cy="dataset"
      >
        {dataset.name}
      </Link>
    );

    if (!submission) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography key="submissions">Submissions</Typography>);

    const submissionHrefs = datasetHrefs.submission({id: submission.id});
    breadcrumbs.push(
      <Link
        key={"submission-" + submission.id}
        to={submissionHrefs.home}
        data-cy="submission"
      >
        {submission.id}
      </Link>
    );

    if (!question) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography key="questions">Questions</Typography>);

    breadcrumbs.push(
      <Link
        key={"question-" + question.id}
        to={submissionHrefs.question({id: question.id})}
        data-cy="question"
      >
        {question.id}
      </Link>
    );

    return breadcrumbs;
  })();

  return <Breadcrumbs data-cy="breadcrumbs">{breadcrumbsChildren}</Breadcrumbs>;
};
