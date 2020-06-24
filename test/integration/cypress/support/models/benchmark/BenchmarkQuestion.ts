export interface BenchmarkQuestion {
  choices: {
    id: string;
    text: string;
    type: string;
  }[];
  concept?: string;
  correctChoiceId: string;
  datasetId: string;
  id: string;
  prompts: {
    text: string;
    type: string;
  }[];
  type: string;
}
