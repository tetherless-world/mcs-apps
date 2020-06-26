/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum BenchmarkQuestionPromptType {
  Goal = "Goal",
  Observation = "Observation",
  Question = "Question",
}

export enum BenchmarkQuestionType {
  MultipleChoice = "MultipleChoice",
  TrueFalse = "TrueFalse",
}

export interface KgNodeFilters {
  datasource?: StringFilter | null;
}

export interface StringFilter {
  exclude?: string[] | null;
  include?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
