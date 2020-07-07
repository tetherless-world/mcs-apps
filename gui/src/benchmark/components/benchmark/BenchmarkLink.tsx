import {Benchmark} from "benchmark/models/benchmark/Benchmark";
import {Link} from "react-router-dom";
import {Hrefs} from "benchmark/Hrefs";
import * as React from "react";
import {CSSProperties} from "@material-ui/core/styles/withStyles";

export const BenchmarkLink: React.FunctionComponent<{
  benchmark: Benchmark;
  style?: CSSProperties;
}> = ({benchmark, style}) => (
  <Link
    style={style}
    to={Hrefs.benchmark({id: benchmark.id}).home}
    data-cy={`benchmark-${benchmark.id}`}
  >
    {benchmark.name}
  </Link>
);
