import * as React from "react";
import MUIDataTable, {MUIDataTableColumnDef} from "mui-datatables";
import {Link} from "react-router-dom";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import {BenchmarkQuestionText} from "benchmark/components/benchmark/BenchmarkQuestionText";
import {List, Typography, ListItemText} from "@material-ui/core";
import {BenchmarkQuestion} from "benchmark/models/benchmark/BenchmarkQuestion";
import {BenchmarkQuestionType} from "benchmark/api/graphqlGlobalTypes";
import {BenchmarkSubmission} from "benchmark/models/benchmark/BenchmarkSubmission";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faTimes} from "@fortawesome/free-solid-svg-icons";

export const BenchmarkQuestionsTable: React.FunctionComponent<{
  benchmarkId: string;
  datasetId: string;
  onChangePage: (kwds: {limit: number; offset: number}) => void;
  questions: BenchmarkQuestion[];
  questionsTotal: number;
  submissionId?: string;
  submissions?: BenchmarkSubmission[];
}> = ({
  benchmarkId,
  datasetId,
  onChangePage,
  questions,
  questionsTotal,
  submissionId,
  submissions,
}) => {
  const getRowQuestionId = (rowData: any[]) => rowData[0];

  const columns: MUIDataTableColumnDef[] = [];
  columns.push({
    name: "id",
    options: {
      display: "false",
    },
  });
  columns.push({
    name: "prompts",
    label: "Text",
    options: {
      customBodyRender: (prompts, tableMeta) => {
        return (
          <span data-cy="question-text">
            {submissionId ? (
              <Link
                data-cy="question-text"
                to={BenchmarkHrefs.benchmark({id: benchmarkId})
                  .dataset({id: datasetId})
                  .submission({id: submissionId})
                  .question({
                    id: getRowQuestionId(tableMeta.rowData),
                  })}
              >
                <BenchmarkQuestionText prompts={prompts} />
              </Link>
            ) : (
              <BenchmarkQuestionText prompts={prompts} />
            )}
          </span>
        );
      },
    },
  });
  if (questions.some((question) => question.type !== null)) {
    columns.push({
      name: "type",
      label: "Type",
      options: {
        customBodyRender: (type) => {
          switch (type) {
            case BenchmarkQuestionType.MultipleChoice:
              return "Multiple Choice";
            case BenchmarkQuestionType.TrueFalse:
              return "True/False";
            default:
              throw new EvalError();
          }
        },
      },
    });
  }
  if (questions.some((question) => question.categories)) {
    columns.push({
      name: "categories",
      label: "Categories",
      options: {
        customBodyRender: (
          categories: string[] | undefined,
          tableMeta: any
        ) => {
          if (categories) {
            return (
              <List>
                {categories.map((category) => (
                  <ListItemText key={category}>{category}</ListItemText>
                ))}
              </List>
            );
          } else {
            return <></>;
          }
        },
      },
    });
  }
  if (questions.some((question) => question.concept)) {
    columns.push({name: "concept", label: "Concept"});
  }
  if (questions.some((question) => question.answers)) {
    const answerSubmissionIds: string[] = []; // No flatMap until ES2019
    for (const question of questions) {
      if (question.answers) {
        for (const answer of question.answers) {
          if (
            !answerSubmissionIds.some(
              (submissionId) => submissionId === answer.submissionId
            )
          ) {
            answerSubmissionIds.push(answer.submissionId);
          }
        }
      }
    }
    for (const answerSubmissionId of answerSubmissionIds) {
      const submission = submissions?.find(
        (submission) => submission.id === answerSubmissionId
      );
      const submissionName = submission ? submission.name : answerSubmissionId;
      columns.push({
        label: submissionName,
        name: answerSubmissionId,
        options: {
          empty: true,
          customBodyRender: (value, tableMeta) => {
            const question = questions[tableMeta.rowIndex];
            const answer = question.answers!.find(
              (answer) => answer.submissionId === tableMeta.columnData.name
            )!;
            const correct = answer.choiceId === question.correctChoiceId;
            return (
              <Link
                to={BenchmarkHrefs.benchmark({id: benchmarkId})
                  .dataset({id: datasetId})
                  .submission({id: answer.submissionId})
                  .question({
                    id: getRowQuestionId(tableMeta.rowData),
                  })}
              >
                {correct ? (
                  <FontAwesomeIcon icon={faCheck} color="green" />
                ) : (
                  <FontAwesomeIcon icon={faTimes} color="red" />
                )}
              </Link>
            );
          },
        },
      });
    }
  }

  return (
    <div data-cy="benchmark-questions">
      <MUIDataTable
        columns={columns}
        data={questions}
        options={{
          count: questionsTotal,
          filter: false,
          onTableChange: (action, tableState) => {
            switch (action) {
              case "changePage": {
                onChangePage({
                  limit: tableState.rowsPerPage,
                  offset: tableState.page * tableState.rowsPerPage,
                });
                break;
              }
            }
          },
          rowsPerPage: questions.length,
          serverSide: true,
          setRowProps: (row) => ({
            "data-cy": "question-" + getRowQuestionId(row),
          }),
          sort: false,
        }}
        title={<Typography variant="h6">Questions</Typography>}
      />
    </div>
  );
};
