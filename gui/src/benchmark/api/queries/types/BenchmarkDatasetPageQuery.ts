/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BenchmarkQuestionPromptType, BenchmarkQuestionType } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: BenchmarkDatasetPageQuery
// ====================================================

export interface BenchmarkDatasetPageQuery_benchmarkById_datasetById_questions_prompts {
  __typename: "BenchmarkQuestionPrompt";
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkDatasetPageQuery_benchmarkById_datasetById_questions_answers {
  __typename: "BenchmarkAnswer";
  choiceId: string;
  submissionId: string;
}

export interface BenchmarkDatasetPageQuery_benchmarkById_datasetById_questions {
  __typename: "BenchmarkQuestion";
  categories: string[] | null;
  concept: string | null;
  correctChoiceId: string;
  id: string;
  prompts: BenchmarkDatasetPageQuery_benchmarkById_datasetById_questions_prompts[];
  type: BenchmarkQuestionType | null;
  answers: BenchmarkDatasetPageQuery_benchmarkById_datasetById_questions_answers[];
}

export interface BenchmarkDatasetPageQuery_benchmarkById_datasetById_submissions {
  __typename: "BenchmarkSubmission";
  id: string;
  name: string;
}

export interface BenchmarkDatasetPageQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  name: string;
  questionsCount: number;
  questions: BenchmarkDatasetPageQuery_benchmarkById_datasetById_questions[];
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
  questionsLimit: number;
  questionsOffset: number;
}
