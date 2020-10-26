import {Benchmark} from "benchmark/models/benchmark/Benchmark";
import {Link} from "react-router-dom";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";
import {BenchmarkHrefsContext} from "benchmark/BenchmarkHrefsContext";

export const BenchmarkLink: React.FunctionComponent<{
  benchmark: Benchmark;
  style?: CSSProperties;
}> = ({benchmark, style}) => {
  const hrefs = React.useContext<BenchmarkHrefs>(BenchmarkHrefsContext);

  return (
    <Link
      style={style}
      to={hrefs.benchmark({id: benchmark.id}).home}
      data-cy={`benchmark-${benchmark.id}`}
    >
      {benchmark.name}
    </Link>
  );
};
