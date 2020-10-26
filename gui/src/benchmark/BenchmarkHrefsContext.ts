import * as React from "react";
import {BenchmarkHrefs} from "./BenchmarkHrefs";

export const BenchmarkHrefsContext = React.createContext<BenchmarkHrefs>(
  new BenchmarkHrefs()
);
