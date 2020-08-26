import * as React from "react";

import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";

import MUIDataTable, {
  MUIDataTableColumn,
  MUIDataTableMeta,
} from "mui-datatables";
import {Typography} from "@material-ui/core";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSearchResultLink} from "shared/components/kg/search/KgSearchResultLink";
import {getKgSearchResultLabel} from "shared/models/kg/search/getKgSearchResultLabel";

// const showListAsColumn = (list: string[]) =>
//   list.map((item) => (
//     <React.Fragment key={item}>
//       {item}
//       <br />
//     </React.Fragment>
//   ));

const columns: MUIDataTableColumn[] = [
  {
    name: "#",
    options: {
      sort: false,
      customBodyRender(_, tableMeta) {
        return (
          tableMeta.tableState.page * tableMeta.tableState.rowsPerPage +
          tableMeta.rowIndex +
          1
        );
      },
    },
  },
  {
    name: "label",
    label: "Label",
    options: {
      sort: true,
      customBodyRender(_, tableMeta) {
        const data = getTableRowData(tableMeta);
        return (
          <KgSearchResultLink result={data.result} sources={data.sources} />
        );
      },
    },
  },
  // {
  //   name: "aliases",
  //   label: "Aliases",
  //   options: {
  //     sort: false,
  //     customBodyRender(aliases) {
  //       return aliases ? showListAsColumn(aliases as string[]) : null;
  //     },
  //   },
  // },
  {
    name: "sources",
    label: "Sources",
    options: {
      sort: true,
      customBodyRender(sources) {
        return sources
          ? (sources as KgSource[]).map((source) => (
              <React.Fragment key={source.id}>
                <KgSourcePill source={source} />
                <br />
              </React.Fragment>
            ))
          : null;
      },
    },
  },
  // {
  //   name: "pos",
  //   label: "Pos",
  //   options: {
  //     sort: false,
  //     customBodyRender(pos) {
  //       return pos ? showListAsColumn((pos as string).split(",")) : null;
  //     },
  //   },
  // },
  // {
  //   name: "pageRank",
  //   label: "PageRank",
  //   options: {
  //     sort: true,
  //     customBodyRender(pageRank) {
  //       return (pageRank as number).toFixed(3);
  //     },
  //   },
  // },
  {
    name: "result",
    options: {
      display: "false",
    },
  },
];

const getTableRowData = (
  tableMeta: MUIDataTableMeta
): KgSearchResultsTableRowData => {
  const rowData = tableMeta.rowData;
  const getColumnData = (name: string): any =>
    rowData[
      columns.findIndex((col) => typeof col !== "string" && col.name === name)
    ];
  return {
    label: getColumnData("label"),
    result: getColumnData("result"),
    sources: getColumnData("sources"),
  };
};

interface KgSearchResultsTableRowData {
  // aliases?: readonly string[];
  label: string;
  result: KgSearchResult;
  sources: readonly KgSource[];
}

export const KgSearchResultsTable: React.FunctionComponent<{
  count: number;
  onChangePage: (newPage: number) => void;
  onChangeRowsPerPage: (newRowsPerPage: number) => void;
  onColumnSortChange: (columnName: string, direction: string) => void;
  page: number;
  results: readonly KgSearchResult[];
  rowsPerPage: number;
  sources: readonly KgSource[];
  title: React.ReactNode;
}> = ({
  count,
  onChangePage,
  onChangeRowsPerPage,
  onColumnSortChange,
  page,
  results,
  rowsPerPage,
  sources,
  title,
}) => {
  // https://github.com/gregnb/mui-datatables/issues/756
  // Since the MUIDataTable has its own state, it ignores passed in values
  // for page and rowsPerPage
  // Workaround by checking the table state via ref and updating
  // with internal api
  const tableCallbackRef = (table: any) => {
    if (!table) {
      return;
    }

    const {page: tablePage, rowsPerPage: tableRowsPerPage} = table.state;

    if (tableRowsPerPage !== rowsPerPage) {
      table.changeRowsPerPage(rowsPerPage);
    }

    if (tablePage !== page) {
      table.changePage(page);
    }
  };

  const data = React.useMemo(() => {
    const rows: KgSearchResultsTableRowData[] = [];
    for (const result of results) {
      rows.push({
        label: getKgSearchResultLabel({result, sources}),
        result,
        sources,
      });
    }
    return rows;
  }, [results, sources]);

  return (
    <div data-cy="matchingNodesTable">
      <MUIDataTable
        // Is a @material-ui property
        // but missing in types
        // @ts-ignore
        innerRef={tableCallbackRef}
        title={
          <Typography variant="h6" data-cy="title">
            {title}
          </Typography>
        }
        data={data}
        columns={columns}
        options={{
          count,
          serverSide: true,
          filter: false,
          selectableRows: "none",
          onChangePage,
          onChangeRowsPerPage,
          onColumnSortChange,
          setRowProps(_, rowIndex) {
            return {"data-cy": "node-" + rowIndex};
          },
        }}
      />
    </div>
  );
};
