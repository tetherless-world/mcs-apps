import * as React from "react";
import {Frame} from "components/frame/Frame";
import {Grid} from "@material-ui/core";
import {
  BenchmarkBreadcrumbs,
  BenchmarkBreadcrumbsProps,
} from "components/benchmark/BenchmarkBreadcrumbs";
import {NotFound} from "components/error/NotFound";
import {ApolloError} from "apollo-client";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import * as ReactLoader from "react-loader";

export interface BenchmarkFrameProps {
  data?: {
    benchmarkById: {
      name: string;
      datasetById?: {
        name: string;
        submissionById?: {} | null;
        questionById?: {} | null;
      } | null;
    } | null;
  };
  loading: boolean;
  error?: ApolloError;
  routeParams: {
    benchmarkId: string;
    datasetId?: string;
    submissionId?: string;
    questionId?: string;
  };
}

export const BenchmarkFrame: React.FunctionComponent<BenchmarkFrameProps> = ({
  children,
  loading,
  error,
  data,
  routeParams: {benchmarkId, datasetId, submissionId, questionId},
}) => {
  if (error) {
    return <ApolloErrorHandler error={error} />;
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
  const dataset = benchmark?.datasetById;
  const question = dataset?.questionById;
  const submission = dataset?.submissionById;

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
        <Grid item container>
          {children}
        </Grid>
      </Grid>
    </Frame>
  );
};
