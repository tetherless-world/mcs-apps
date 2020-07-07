import {
  BenchmarkQuestionPromptType,
  BenchmarkQuestionType,
} from "api/graphqlGlobalTypes";

export interface BenchmarkQuestion {
  answers?: {
    choiceId: string;
    submissionId: string;
  }[];
  categories: string[] | null;
  concept: string | null;
  correctChoiceId: string;
  id: string;
  prompts: {
    text: string;
    type: BenchmarkQuestionPromptType;
  }[];
  type: BenchmarkQuestionType | null;
}
