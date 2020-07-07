/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { BenchmarkQuestionPromptType, BenchmarkQuestionType } from "./../../graphqlGlobalTypes";

// ====================================================
// GraphQL fragment: BenchmarkQuestionsTableFragment
// ====================================================

export interface BenchmarkQuestionsTableFragment_prompts {
  __typename: "BenchmarkQuestionPrompt";
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkQuestionsTableFragment {
  __typename: "BenchmarkQuestion";
  categories: string[] | null;
  concept: string | null;
  correctChoiceId: string;
  id: string;
  prompts: BenchmarkQuestionsTableFragment_prompts[];
  type: BenchmarkQuestionType | null;
}
