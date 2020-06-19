import * as React from "react";
import {Link} from "react-router-dom";
import {Breadcrumbs, Typography} from "@material-ui/core";
import {Hrefs} from "Hrefs";

export const BenchmarkBreadcrumbs: React.FunctionComponent<{
  benchmark?: {id: string; name: string};
  dataset?: {id: string; name: string};
  question?: {id: string};
  submission?: {id: string; name: string};
}> = ({benchmark, dataset, question, submission}) => {
  const breadcrumbsChildren: React.ReactNode = (() => {
    const breadcrumbs: React.ReactNodeArray = [
      <Link to={Hrefs.benchmarks}>Benchmarks</Link>,
    ];

    if (!benchmark) {
      return breadcrumbs;
    }

    const benchmarkHrefs = Hrefs.benchmark({id: benchmark.id});
    breadcrumbs.push(<Link to={benchmarkHrefs.home}>{benchmark.name}</Link>);

    if (!dataset) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography>Datasets</Typography>);

    const datasetHrefs = benchmarkHrefs.dataset({id: dataset.id});
    breadcrumbs.push(<Link to={datasetHrefs.home}>{dataset.name}</Link>);

    if (!submission) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography>Submissions</Typography>);

    const submissionHrefs = datasetHrefs.submission({id: submission.id});
    breadcrumbs.push(<Link to={submissionHrefs.home}>{submission.id}</Link>);

    if (!question) {
      return breadcrumbs;
    }

    breadcrumbs.push(<Typography>Questions</Typography>);

    breadcrumbs.push(
      <Link to={submissionHrefs.question({id: question.id})}>
        {question.id}
      </Link>
    );

    return breadcrumbs;
  })();

  return <Breadcrumbs>{breadcrumbsChildren}</Breadcrumbs>;
};
