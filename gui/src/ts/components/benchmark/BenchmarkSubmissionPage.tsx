import * as React from "react";
import {useParams} from "react-router-dom";
import {useQuery} from "@apollo/react-hooks";
import * as BenchmarkSubmissionPageQueryDocument from "api/queries/benchmark/BenchmarkSubmissionPageQuery.graphql";
import {BenchmarkSubmissionPageQuery} from "api/queries/benchmark/types/BenchmarkSubmissionPageQuery";
import {Frame} from "components/frame/Frame";
import {NotFound} from "components/error/NotFound";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";

export const BenchmarkSubmissionPage: React.FunctionComponent = () => {
  const {benchmarkId, datasetId, submissionId} = useParams<{
    benchmarkId: string;
    datasetId: string;
    submissionId: string;
  }>();

  const query = useQuery<BenchmarkSubmissionPageQuery>(
    BenchmarkSubmissionPageQueryDocument,
    {variables: {benchmarkId, datasetId}}
  );

  return (
    <Frame {...query}>
      {({data}) => {
        const benchmark = data.benchmarkById;
        if (!benchmark) {
          return <NotFound label={benchmarkId} />;
        }
        const dataset = benchmark.datasetById;
        if (!dataset) {
          return <NotFound label={datasetId} />;
        }
        const submission = dataset.submissionById;
        if (!submission) {
          return <NotFound label={submissionId} />;
        }

        return (
          <BenchmarkFrame
            title={submission.name}
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
              dataset: {id: datasetId, name: dataset.name},
              submission: {id: submissionId, name: submission.name},
            }}
          >
            <div></div>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
