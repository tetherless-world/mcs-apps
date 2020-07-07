import * as React from "react";
import {BenchmarkSubmission} from "benchmark/models/benchmark/BenchmarkSubmission";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import {BenchmarkDataset} from "benchmark/models/benchmark/BenchmarkDataset";
import {BenchmarkSubmissionLink} from "benchmark/components/benchmark/BenchmarkSubmissionLink";
import {BenchmarkDatasetLink} from "benchmark/components/benchmark/BenchmarkDatasetLink";

export const BenchmarkSubmissionsTable: React.FunctionComponent<{
  benchmarkDatasets?: BenchmarkDataset[];
  benchmarkSubmissions: BenchmarkSubmission[];
}> = ({benchmarkDatasets, benchmarkSubmissions}) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        {benchmarkDatasets ? <TableCell>Dataset</TableCell> : null}
      </TableRow>
    </TableHead>
    <TableBody>
      {benchmarkSubmissions.map((submission) => {
        const dataset = benchmarkDatasets?.find(
          (dataset) => dataset.id === submission.datasetId
        );
        return (
          <TableRow data-cy={"submission-" + submission.id} key={submission.id}>
            <TableCell data-cy={"submission-name"}>
              <BenchmarkSubmissionLink
                benchmarkSubmission={submission}
                style={{fontSize: "larger"}}
              />
            </TableCell>
            {benchmarkDatasets ? (
              <TableCell data-cy="submission-dataset-name">
                <BenchmarkDatasetLink
                  benchmarkDataset={
                    dataset
                      ? dataset
                      : {id: submission.datasetId, name: submission.datasetId}
                  }
                  benchmarkId={submission.benchmarkId}
                />
              </TableCell>
            ) : null}
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
