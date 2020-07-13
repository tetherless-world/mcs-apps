import {Benchmark} from "benchmark/models/benchmark/Benchmark";
import {Link} from "react-router-dom";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";

export const BenchmarkLink: React.FunctionComponent<{
  benchmark: Benchmark;
  style?: CSSProperties;
}> = ({benchmark, style}) => (
  <Link
    style={style}
    to={BenchmarkHrefs.benchmark({id: benchmark.id}).home}
    data-cy={`benchmark-${benchmark.id}`}
  >
    {benchmark.name}
  </Link>
);
