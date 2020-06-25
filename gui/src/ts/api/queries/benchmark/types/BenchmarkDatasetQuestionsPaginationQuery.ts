/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BenchmarkQuestionPromptType, BenchmarkQuestionType } from "./../../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: BenchmarkDatasetQuestionsPaginationQuery
// ====================================================

export interface BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById_questions_prompts {
  __typename: "BenchmarkQuestionPrompt";
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById_questions {
  __typename: "BenchmarkQuestion";
  categories: string[] | null;
  concept: string | null;
  id: string;
  prompts: BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById_questions_prompts[];
  type: BenchmarkQuestionType | null;
}

export interface BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  questions: BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById_questions[];
}

export interface BenchmarkDatasetQuestionsPaginationQuery_benchmarkById {
  __typename: "Benchmark";
  datasetById: BenchmarkDatasetQuestionsPaginationQuery_benchmarkById_datasetById | null;
}

export interface BenchmarkDatasetQuestionsPaginationQuery {
  benchmarkById: BenchmarkDatasetQuestionsPaginationQuery_benchmarkById | null;
}

export interface BenchmarkDatasetQuestionsPaginationQueryVariables {
  benchmarkId: string;
  datasetId: string;
  questionsLimit: number;
  questionsOffset: number;
}
