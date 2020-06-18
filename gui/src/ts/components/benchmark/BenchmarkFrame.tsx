import * as React from "react";
import {Frame} from "components/frame/Frame";
import {Grid} from "@material-ui/core";
import {
  BenchmarkBreadcrumbs,
  BenchmarkBreadcrumbsProps,
} from "components/benchmark/BenchmarkBreadcrumbs";
import {NotFound} from "components/error/NotFound";

export interface BenchmarkFrameProps {
  data: {
    benchmark?: {name: string} | null;
    submission?: {} | null;
    dataset?: {name: string} | null;
    question?: {} | null;
  };
  routeParams: {
    benchmarkId: string;
    datasetId?: string;
    submissionId?: string;
    questionId?: string;
  };
}

export const BenchmarkFrame: React.FunctionComponent<BenchmarkFrameProps> = ({
  children,
  data: {benchmark, submission, dataset, question},
  routeParams: {benchmarkId, datasetId, submissionId, questionId},
}) => {
  if (!benchmark) {
    return <NotFound label={benchmarkId} />;
  }

  if (datasetId && !dataset) {
    return <NotFound label={datasetId} />;
  }

  if (questionId && !question) {
    return <NotFound label={questionId} />;
  }

  if (submissionId && !submission) {
    return <NotFound label={submissionId} />;
  }

  const breadcrumbsProps: BenchmarkBreadcrumbsProps = {
    benchmarkId,
    datasetId,
    submissionId,
    questionId,
    benchmarkName: benchmark?.name,
    datasetName: dataset?.name,
  };

  return (
    <Frame>
      <Grid container direction="column">
        <Grid item>
          <BenchmarkBreadcrumbs {...breadcrumbsProps} />
        </Grid>
        <Grid item>{children}</Grid>
      </Grid>
    </Frame>
  );
};
