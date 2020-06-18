import {BenchmarkDataset} from "./BenchmarkDataset";

export interface Benchmark {
  datasets: BenchmarkDataset[];
  id: string;
  name: string;
}
