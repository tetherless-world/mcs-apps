/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BenchmarkDatasetQuestionPaginationQuery
// ====================================================

export interface BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions {
  __typename: "BenchmarkQuestion";
  concept: string | null;
  id: string;
  text: string;
}

export interface BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  questions: BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions[];
}

export interface BenchmarkDatasetQuestionPaginationQuery_benchmarkById {
  __typename: "Benchmark";
  datasetById: BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById | null;
}

export interface BenchmarkDatasetQuestionPaginationQuery {
  benchmarkById: BenchmarkDatasetQuestionPaginationQuery_benchmarkById | null;
}

export interface BenchmarkDatasetQuestionPaginationQueryVariables {
  benchmarkId: string;
  datasetId: string;
  questionLimit: number;
  questionOffset: number;
}
