/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BenchmarkSubmissionPageQuery
// ====================================================

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById_questions_choices {
  __typename: "BenchmarkQuestionChoice";
  label: string;
  text: string;
}

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById_questions {
  __typename: "BenchmarkQuestion";
  choices: BenchmarkSubmissionPageQuery_benchmarkById_datasetById_questions_choices[];
  concept: string | null;
  id: string;
  text: string;
}

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById_submissionById {
  __typename: "BenchmarkSubmission";
  name: string;
}

export interface BenchmarkSubmissionPageQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  name: string;
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
  questionLimit: number;
  questionOffset: number;
  submissionId: string;
}
