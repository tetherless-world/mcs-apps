import {Link} from "react-router-dom";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {BenchmarkSubmission} from "benchmark/models/benchmark/BenchmarkSubmission";

export const BenchmarkSubmissionLink: React.FunctionComponent<{
  benchmarkSubmission: BenchmarkSubmission;
  style?: CSSProperties;
}> = ({benchmarkSubmission, style}) => (
  <Link
    style={{fontSize: "larger"}}
    to={
      BenchmarkHrefs.benchmark({id: benchmarkSubmission.benchmarkId})
        .dataset({
          id: benchmarkSubmission.datasetId,
        })
        .submission({id: benchmarkSubmission.id}).home
    }
  >
    {benchmarkSubmission.name}
  </Link>
);
