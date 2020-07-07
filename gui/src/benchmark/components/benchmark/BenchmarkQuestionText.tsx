import * as React from "react";
import {BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_prompts} from "benchmark/api/queries/types/BenchmarkAnswerPageQuery";
import {BenchmarkQuestionPromptType} from "benchmark/api/graphqlGlobalTypes";

export const BenchmarkQuestionText: React.FunctionComponent<{
  prompts: BenchmarkAnswerPageQuery_benchmarkById_datasetById_questionById_prompts[];
  questionStyle?: React.CSSProperties;
}> = ({prompts, questionStyle}) => {
  const goals = prompts.filter(
    (prompt) => prompt.type === BenchmarkQuestionPromptType.Goal
  );
  const observations = prompts.filter(
    (prompt) => prompt.type === BenchmarkQuestionPromptType.Observation
  );
  const questions = prompts.filter(
    (prompt) => prompt.type === BenchmarkQuestionPromptType.Question
  );

  return (
    <React.Fragment>
      {observations.length
        ? observations.map((observation, observationIndex) => (
            <span
              key={"observation-" + observationIndex}
              data-cy={"observation-" + observationIndex}
            >
              Observation: {observation.text}
            </span>
          ))
        : null}
      {goals.length
        ? goals.map((goal, goalIndex) => (
            <span key={"goal-" + goalIndex} data-cy={"goal-" + goalIndex}>
              Goal: {goal.text}
            </span>
          ))
        : null}
      {questions.length
        ? questions.map((question, questionIndex) => (
            <span
              style={questionStyle}
              key={"question-" + questionIndex}
              data-cy={"question-" + questionIndex}
            >
              Question: {question.text}
            </span>
          ))
        : null}
    </React.Fragment>
  );
};
