import * as React from "react";
import {Link} from "react-router-dom";
import {Breadcrumbs, Typography} from "@material-ui/core";
import {Hrefs} from "Hrefs";

export interface BenchmarkBreadcrumbsProps {
  benchmarkId: string;
  benchmarkName?: string;
  datasetId?: string;
  datasetName?: string;
  submissionId?: string;
  questionId?: string;
}

export const BenchmarkBreadcrumbs: React.FunctionComponent<BenchmarkBreadcrumbsProps> = ({
  benchmarkId,
  benchmarkName,
  datasetId,
  datasetName,
  submissionId,
  questionId,
}) => {
  const breadcrumbsChildren: React.ReactNode = (() => {
    const breadcrumbs: React.ReactNodeArray = [
      <Link to={Hrefs.benchmarks}>Benchmarks</Link>,
    ];

    if (!benchmarkId) {
      return breadcrumbs;
    }

    const benchmark = Hrefs.benchmark({id: benchmarkId});
    breadcrumbs.push(<Link to={benchmark.home}>{benchmarkName}</Link>);

    if (!datasetId) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography>Datasets</Typography>);

    const dataset = benchmark.dataset({id: datasetId});
    breadcrumbs.push(<Link to={dataset.home}>{datasetName}</Link>);

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
