/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BenchmarkQuestionPromptType, BenchmarkQuestionType } from "./../../../graphqlGlobalTypes";

// ====================================================
// GraphQL fragment: BenchmarkQuestionFragment
// ====================================================

export interface BenchmarkQuestionFragment_prompts {
  __typename: "BenchmarkQuestionPrompt";
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkQuestionFragment {
  __typename: "BenchmarkQuestion";
  categories: string[] | null;
  concept: string | null;
  id: string;
  prompts: BenchmarkQuestionFragment_prompts[];
  type: BenchmarkQuestionType | null;
}
