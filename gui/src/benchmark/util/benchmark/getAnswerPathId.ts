import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths as QuestionAnswerPath} from "benchmark/api/queries/types/BenchmarkAnswerPageQuery";
import {getQuestionAnswerPathId} from "benchmark/util/benchmark/getQuestionAnswerPathId";

export const getAnswerPathId = (
  questionAnswerPathId: QuestionAnswerPath,
  answerPathIndex: number
) => `${getQuestionAnswerPathId(questionAnswerPathId)}-${answerPathIndex}`;
