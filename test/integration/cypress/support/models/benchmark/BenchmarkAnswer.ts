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
  choiceId: string;
  questionAnswerPaths: BenchmarkAnswerQuestionAnswerPath[];
}

export interface BenchmarkAnswer {
  choiceId: string;
  questionId: string;
  submissionId: string;
  explanation: {
    choiceAnalyses: BenchmarkAnswerChoiceAnalysis[];
  };
}
