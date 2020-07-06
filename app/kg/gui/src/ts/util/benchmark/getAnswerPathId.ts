import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_submissionById_answerByQuestionId_explanation_choiceAnalyses_questionAnswerPaths as QuestionAnswerPath} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";
import {getQuestionAnswerPathId} from "util/benchmark/getQuestionAnswerPathId";

export const getAnswerPathId = (
  questionAnswerPathId: QuestionAnswerPath,
  answerPathIndex: number
) => `${getQuestionAnswerPathId(questionAnswerPathId)}-${answerPathIndex}`;
