import * as React from "react";
import MUIDataTable from "mui-datatables";
import {Link} from "react-router-dom";
import {Hrefs} from "Hrefs";
import {BenchmarkQuestionText} from "components/benchmark/BenchmarkQuestionText";
import {Typography} from "@material-ui/core";
import {BenchmarkQuestion} from "models/benchmark/BenchmarkQuestion";

export const BenchmarkQuestionsTable: React.FunctionComponent<{
  benchmarkId: string;
  datasetId: string;
  onChangePage: (kwds: {limit: number; offset: number}) => void;
  questions: BenchmarkQuestion[];
  questionsTotal: number;
  submissionId?: string;
}> = ({
  benchmarkId,
  datasetId,
  onChangePage,
  questions,
  questionsTotal,
  submissionId,
}) => {
  const getRowQuestionId = (rowData: any[]) => rowData[2];

  return (
    <MUIDataTable
      columns={[
        {
          name: "prompts",
          label: "Text",
          options: {
            customBodyRender: (prompts, tableMeta) => {
              if (submissionId) {
                return (
                  <Link
                    data-cy="question-text"
                    to={Hrefs.benchmark({id: benchmarkId})
                      .dataset({id: datasetId})
                      .submission({id: submissionId})
                      .question({
                        id: getRowQuestionId(tableMeta.rowData),
                      })}
                  >
                    <BenchmarkQuestionText prompts={prompts} />
                  </Link>
                );
              } else {
                return <BenchmarkQuestionText prompts={prompts} />;
              }
            },
          },
        },
        {name: "concept", label: "Concept"},
        {name: "id", label: "Id"},
      ]}
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
  );
};
