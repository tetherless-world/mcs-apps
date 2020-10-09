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
  // Do a first pass over questions to index them and gather the answer submission id's
  const answerSubmissionIds: string[] = []; // No flatMap until ES2019
  let includeCategoriesColumn: boolean = false;
  let includeConceptColumn: boolean = false;
  let includeTypeColumn: boolean = false;
  const questionsById: {[index: string]: BenchmarkQuestion} = {};
  for (const question of questions) {
    questionsById[question.id] = question;

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

    if (question.categories) {
      includeCategoriesColumn = true;
    }

    if (question.concept) {
      includeConceptColumn = true;
    }

    if (question.type !== null) {
      includeTypeColumn = true;
    }
  }

  // Do a second pass to create the row data.
  // Need to do two passes because we don't know how many answer columns there will be until we do a pass.
  // Have to do any because there can be an arbitrary number of  answerSubmissionId's columns attached to the row.
  const data: any[] = questions.map((question) => {
    const row: any = {
      categories: question.categories?.join("|"),
      id: question.id,
      prompts: "",
      type: question.type,
    };
    if (question.answers) {
      for (const answer of question.answers) {
        row[answer.submissionId] = "";
      }
    }
    return row;
  });

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
      customBodyRender: (_, tableMeta) => {
        const questionId = getRowQuestionId(tableMeta.rowData);
        const question = questionsById[questionId];
        const prompts = question.prompts;
        return (
          <span data-cy="question-text">
            {submissionId ? (
              <Link
                data-cy="question-text"
                to={BenchmarkHrefs.benchmark({id: benchmarkId})
                  .dataset({id: datasetId})
                  .submission({id: submissionId})
                  .question({
                    id: questionId,
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
  if (includeTypeColumn) {
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
  if (includeCategoriesColumn) {
    columns.push({
      name: "categories",
      label: "Categories",
      options: {
        customBodyRender: (categories: string, tableMeta: any) => {
          if (categories) {
            return (
              <List>
                {categories.split("|").map((category) => (
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
  if (includeConceptColumn) {
    columns.push({name: "concept", label: "Concept"});
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
        customBodyRender: (_, tableMeta) => {
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

  return (
    <div data-cy="benchmark-questions">
      <MUIDataTable
        columns={columns}
        data={data}
        options={{
          count: questionsTotal,
          download: false,
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
