/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BenchmarkDatasetPageQuery
// ====================================================

export interface BenchmarkDatasetPageQuery_benchmarkById_datasetById_submissions {
  __typename: "BenchmarkSubmission";
  id: string;
  name: string;
}

export interface BenchmarkDatasetPageQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  name: string;
  submissions: BenchmarkDatasetPageQuery_benchmarkById_datasetById_submissions[];
}

export interface BenchmarkDatasetPageQuery_benchmarkById {
  __typename: "Benchmark";
  datasetById: BenchmarkDatasetPageQuery_benchmarkById_datasetById | null;
  name: string;
}

export interface BenchmarkDatasetPageQuery {
  benchmarkById: BenchmarkDatasetPageQuery_benchmarkById | null;
}

export interface BenchmarkDatasetPageQueryVariables {
  benchmarkId: string;
  datasetId: string;
}
