/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BenchmarkQuestionPromptType } from "./../../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: BenchmarkDatasetQuestionPaginationQuery
// ====================================================

export interface BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions_prompts {
  __typename: "BenchmarkQuestionPrompt";
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions {
  __typename: "BenchmarkQuestion";
  concept: string | null;
  id: string;
  prompts: BenchmarkDatasetQuestionPaginationQuery_benchmarkById_datasetById_questions_prompts[];
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
