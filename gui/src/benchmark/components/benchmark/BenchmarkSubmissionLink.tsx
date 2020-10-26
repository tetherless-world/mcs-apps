import {Link} from "react-router-dom";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {BenchmarkSubmission} from "benchmark/models/benchmark/BenchmarkSubmission";
import {BenchmarkHrefsContext} from "benchmark/BenchmarkHrefsContext";

export const BenchmarkSubmissionLink: React.FunctionComponent<{
  benchmarkSubmission: BenchmarkSubmission;
  style?: CSSProperties;
}> = ({benchmarkSubmission, style}) => {
  const hrefs = React.useContext<BenchmarkHrefs>(BenchmarkHrefsContext);
  return (
    <Link
      style={{fontSize: "larger"}}
      to={
        hrefs
          .benchmark({id: benchmarkSubmission.benchmarkId})
          .dataset({
            id: benchmarkSubmission.datasetId,
          })
          .submission({id: benchmarkSubmission.id}).home
      }
    >
      {benchmarkSubmission.name}
    </Link>
  );
};
