/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BenchmarkAnswerPageQuery
// ====================================================

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_choices {
  __typename: "BenchmarkQuestionChoice";
  label: string;
  text: string;
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById {
  __typename: "BenchmarkQuestion";
  choices: BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_choices[];
  text: string;
  correctChoiceLabel: string;
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths_paths {
  __typename: "BenchmarkQuestionAnswerPath";
  path: string[];
  score: number;
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths {
  __typename: "BenchmarkQuestionAnswerPaths";
  endNodeId: string;
  startNodeId: string;
  paths: BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths_paths[];
  score: number;
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses {
  __typename: "BenchmarkQuestionChoiceAnalysis";
  choiceLabel: string;
  questionAnswerPaths: BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths[];
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation {
  __typename: "BenchmarkAnswerExplanation";
  choiceAnalyses: BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses[] | null;
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId {
  __typename: "BenchmarkAnswer";
  choiceLabel: string;
  explanation: BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation | null;
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById {
  __typename: "BenchmarkSubmission";
  answerByQuestionId: BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId | null;
  name: string;
}

export interface BenchmarkAnswerPageQuery_benchmarkById_datasetById {
  __typename: "BenchmarkDataset";
  name: string;
  questionById: BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById | null;
  submissionById: BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById | null;
}

export interface BenchmarkAnswerPageQuery_benchmarkById {
  __typename: "Benchmark";
  name: string;
  datasetById: BenchmarkAnswerPageQuery_benchmarkById_datasetById | null;
}

export interface BenchmarkAnswerPageQuery {
  benchmarkById: BenchmarkAnswerPageQuery_benchmarkById | null;
}

export interface BenchmarkAnswerPageQueryVariables {
  benchmarkId: string;
  questionId: string;
  datasetId: string;
  submissionId: string;
}
