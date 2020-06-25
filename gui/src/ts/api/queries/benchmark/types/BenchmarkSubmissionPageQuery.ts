/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BenchmarkQuestionPromptType, BenchmarkQuestionType } from "./../../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: BenchmarkSubmissionPageQuery
// ====================================================

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById_questions_prompts {
  __typename: "BenchmarkQuestionPrompt";
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById_questions {
  __typename: "BenchmarkQuestion";
  categories: string[] | null;
  concept: string | null;
  id: string;
  prompts: BenchmarkSubmissionPageQuery_benchmarkById_datasetById_questions_prompts[];
  type: BenchmarkQuestionType | null;
}

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById_submissionById {
  __typename: "BenchmarkSubmission";
  name: string;
}

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  name: string;
  questionsCount: number;
  questions: BenchmarkSubmissionPageQuery_benchmarkById_datasetById_questions[];
  submissionById: BenchmarkSubmissionPageQuery_benchmarkById_datasetById_submissionById | null;
}

export interface BenchmarkSubmissionPageQuery_benchmarkById {
  __typename: "Benchmark";
  datasetById: BenchmarkSubmissionPageQuery_benchmarkById_datasetById | null;
  name: string;
}

export interface BenchmarkSubmissionPageQuery {
  benchmarkById: BenchmarkSubmissionPageQuery_benchmarkById | null;
}

export interface BenchmarkSubmissionPageQueryVariables {
  benchmarkId: string;
  datasetId: string;
  questionsLimit: number;
  questionsOffset: number;
  submissionId: string;
}
