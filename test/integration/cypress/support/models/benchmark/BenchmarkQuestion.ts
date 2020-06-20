interface BenchmarkQuestionAnswerChoice {
  label: string;
  text: string;
}

export interface BenchmarkQuestion {
  choices: BenchmarkQuestionAnswerChoice[];
  id: string;
  datasetId: string;
  text: string;
  concept: string;
  correctChoiceLabel: string;
}
