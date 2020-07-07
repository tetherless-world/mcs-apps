import {Link} from "react-router-dom";
import {Hrefs} from "benchmark/Hrefs";
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
      Hrefs.benchmark({id: benchmarkSubmission.benchmarkId})
        .dataset({
          id: benchmarkSubmission.datasetId,
        })
        .submission({id: benchmarkSubmission.id}).home
    }
  >
    {benchmarkSubmission.name}
  </Link>
);
