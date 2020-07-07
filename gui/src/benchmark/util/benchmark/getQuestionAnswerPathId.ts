import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths as QuestionAnswerPath} from "benchmark/api/queries/types/BenchmarkAnswerPageQuery";

export const getQuestionAnswerPathId = ({
  startNodeId,
  endNodeId,
}: QuestionAnswerPath) => `${startNodeId}-${endNodeId}`;
