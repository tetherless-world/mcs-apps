import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths as QuestionAnswerPath} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";

export const getQuestionAnswerPathId = ({
  startNodeId,
  endNodeId,
}: QuestionAnswerPath) => `${startNodeId}-${endNodeId}`;
