enum BenchmarkQuestionPromptType {
  Goal = "Goal",
  Observation = "Observation",
  Question = "Question",
}

enum BenchmarkQuestionType {
  MultipleChoice = "MultipleChoice",
  TrueFalse = "TrueFalse",
}

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
