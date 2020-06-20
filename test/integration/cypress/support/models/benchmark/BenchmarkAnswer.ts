interface Path {
  path: string[];
  score: number;
}

interface BenchmarkAnswerQuestionAnswerPath {
  startNodeId: string;
  endNodeId: string;
  paths: Path[];
  score: number;
}

interface BenchmarkAnswerChoiceAnalysis {
  choiceLabel: string;
  questionAnswerPaths: BenchmarkAnswerQuestionAnswerPath[];
}

export interface BenchmarkAnswer {
  choiceLabel: string;
  questionId: string;
  submissionId: string;
  explanation: {
    choiceAnalyses: BenchmarkAnswerChoiceAnalysis[];
  };
}
