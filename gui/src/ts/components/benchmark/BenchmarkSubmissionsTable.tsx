import * as React from "react";
import {BenchmarkSubmission} from "models/benchmark/BenchmarkSubmission";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {Hrefs} from "Hrefs";

export const BenchmarkSubmissionsTable: React.FunctionComponent<{
  benchmarkSubmissions: BenchmarkSubmission[];
}> = ({benchmarkSubmissions}) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {benchmarkSubmissions.map((submission) => (
        <TableRow data-cy={"submission-" + submission.id} key={submission.id}>
          <TableCell data-cy={"submission-name"}>
            <Link
              style={{fontSize: "larger"}}
              to={
                Hrefs.benchmark({id: submission.benchmarkId})
                  .dataset({
                    id: submission.datasetId,
                  })
                  .submission({id: submission.id}).home
              }
            >
              {submission.name}
            </Link>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
