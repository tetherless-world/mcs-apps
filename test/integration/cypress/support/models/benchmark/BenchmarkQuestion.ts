enum BenchmarkQuestionPromptType {
  Goal = "Goal",
  Observation = "Observation",
  Question = "Question",
}

interface BenchmarkQuestionPrompt {
  text: string;
  type: BenchmarkQuestionPromptType;
}

export interface BenchmarkQuestion {
  choices: {
    id: string;
    identifier?: string;
    position: number;
    text: string;
  }[];
  concept?: string;
  correctChoiceId: string;
  datasetId: string;
  id: string;
  prompts: BenchmarkQuestionPrompt[];
}
