/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BenchmarkQuestionPromptType, BenchmarkQuestionType } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL query operation: BenchmarkSubmissionQuestionsPaginationQuery
// ====================================================

export interface BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions_prompts {
  __typename: "BenchmarkQuestionPrompt";
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions_answerBySubmissionId {
  __typename: "BenchmarkAnswer";
  choiceId: string;
}

export interface BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions {
  __typename: "BenchmarkQuestion";
  categories: string[] | null;
  concept: string | null;
  correctChoiceId: string;
  id: string;
  prompts: BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions_prompts[];
  type: BenchmarkQuestionType | null;
  answerBySubmissionId: BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions_answerBySubmissionId | null;
}

export interface BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  questions: BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById_questions[];
}

export interface BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById {
  __typename: "Benchmark";
  datasetById: BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById_datasetById | null;
}

export interface BenchmarkSubmissionQuestionsPaginationQuery {
  benchmarkById: BenchmarkSubmissionQuestionsPaginationQuery_benchmarkById | null;
}

export interface BenchmarkSubmissionQuestionsPaginationQueryVariables {
  benchmarkId: string;
  datasetId: string;
  questionsLimit: number;
  questionsOffset: number;
  submissionId: string;
}
