import * as React from "react";
import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_prompts} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";
import {BenchmarkQuestionPromptType} from "api/graphqlGlobalTypes";

export const BenchmarkQuestionText: React.FunctionComponent<{
  prompts: BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_prompts[];
}> = ({prompts}) => {
  const questionPrompt = prompts.find(
    (prompt) => prompt.type === BenchmarkQuestionPromptType.Question
  );
  if (questionPrompt) {
    return <span data-cy="questionText">{questionPrompt.text}</span>;
  } else {
    throw new EvalError();
  }
};
