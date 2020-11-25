import {Link} from "react-router-dom";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {BenchmarkDataset} from "benchmark/models/benchmark/BenchmarkDataset";
import {BenchmarkHrefsContext} from "benchmark/BenchmarkHrefsContext";

export const BenchmarkDatasetLink: React.FunctionComponent<{
  benchmarkDataset: BenchmarkDataset;
  benchmarkId: string;
  style?: CSSProperties;
}> = ({benchmarkDataset, benchmarkId, style}) => {
  const hrefs = React.useContext<BenchmarkHrefs>(BenchmarkHrefsContext);

  return (
    <Link
      style={{fontSize: "larger"}}
      to={
        hrefs.benchmark({id: benchmarkId}).dataset({
          id: benchmarkDataset.id,
        }).home
      }
    >
      {benchmarkDataset.name}
    </Link>
  );
};
