import {Link} from "react-router-dom";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {BenchmarkDataset} from "benchmark/models/benchmark/BenchmarkDataset";

export const BenchmarkDatasetLink: React.FunctionComponent<{
  benchmarkDataset: BenchmarkDataset;
  benchmarkId: string;
  style?: CSSProperties;
}> = ({benchmarkDataset, benchmarkId, style}) => (
  <Link
    style={{fontSize: "larger"}}
    to={
      BenchmarkHrefs.benchmark({id: benchmarkId}).dataset({
        id: benchmarkDataset.id,
      }).home
    }
  >
    {benchmarkDataset.name}
  </Link>
);
