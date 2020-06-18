/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BenchmarkPageQuery
// ====================================================

export interface BenchmarkPageQuery_benchmarkById_datasets {
  __typename: "BenchmarkDataset";
  id: string;
  name: string;
}

export interface BenchmarkPageQuery_benchmarkById {
  __typename: "Benchmark";
  datasets: BenchmarkPageQuery_benchmarkById_datasets[];
  name: string;
}

export interface BenchmarkPageQuery {
  benchmarkById: BenchmarkPageQuery_benchmarkById | null;
}

export interface BenchmarkPageQueryVariables {
  benchmarkId: string;
}
