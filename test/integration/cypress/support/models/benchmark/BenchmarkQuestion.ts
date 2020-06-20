export interface BenchmarkQuestion {
  choices: {
    label: string;
    text: string;
  }[];
  concept?: string;
  correctChoiceLabel: string;
  datasetId: string;
  id: string;
  text: string;
}
