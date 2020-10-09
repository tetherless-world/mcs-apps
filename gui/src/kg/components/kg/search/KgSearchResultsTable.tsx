import * as React from "react";

import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";

import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {Typography} from "@material-ui/core";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgSearchResult} from "shared/models/kg/search/KgSearchResult";
import {KgSearchResultLink} from "shared/components/kg/search/KgSearchResultLink";
import {getKgSearchResultLabel} from "shared/models/kg/search/getKgSearchResultLabel";
import {getKgSearchResultSourceIds} from "shared/models/kg/search/getKgSearchResultSourceIds";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";

// const showListAsColumn = (list: string[]) =>
//   list.map((item) => (
//     <React.Fragment key={item}>
//       {item}
//       <br />
//     </React.Fragment>
//   ));

export const KgSearchResultsTable: React.FunctionComponent<{
  allSources: readonly KgSource[];
  count: number;
  onChangePage: (newPage: number) => void;
  onChangeRowsPerPage: (newRowsPerPage: number) => void;
  onColumnSortChange: (columnName: string, direction: string) => void;
  page: number;
  results: readonly KgSearchResult[];
  rowsPerPage: number;
  title: React.ReactNode;
}> = ({
  allSources,
  count,
  onChangePage,
  onChangeRowsPerPage,
  onColumnSortChange,
  page,
  results,
  rowsPerPage,
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
    const getResultTypeLabel = (result: KgSearchResult): string => {
      switch (result.__typename) {
        case "KgEdgeLabelSearchResult":
          return "Edge label";
        case "KgEdgeSearchResult":
          return "Edge";
        case "KgNodeSearchResult":
          return "Node";
        case "KgNodeLabelSearchResult":
          return "Node label";
        case "KgSourceSearchResult":
          return "Source";
        default:
          throw new EvalError();
      }
    };

    const rows: {
      label: string;
      sourceIds: string;
      typeLabel: string;
    }[] = [];
    for (const result of results) {
      rows.push({
        label: getKgSearchResultLabel({allSources, result}),
        sourceIds: getKgSearchResultSourceIds({result}).join("|"),
        typeLabel: getResultTypeLabel(result),
      });
    }
    return rows;
  }, [allSources, results]);

  const columns: MUIDataTableColumn[] = React.useMemo(
    () => [
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
            return (
              <KgSearchResultLink
                allSources={allSources}
                result={results[tableMeta.rowIndex]}
              />
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
        name: "typeLabel",
        label: "Type",
        options: {
          sort: false,
        },
      },
      {
        name: "sourceIds",
        label: "Sources",
        options: {
          sort: true,
          customBodyRender(sourceIds, tableMeta) {
            return sourceIds
              ? sourceIds
                  .split("|")
                  .map((sourceId) => resolveSourceId({allSources, sourceId}))
                  .map((source, sourceIndex) => (
                    <span data-cy={`source-${sourceIndex}`} key={source.id}>
                      <KgSourcePill source={source} />
                      <br />
                    </span>
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
    ],
    [allSources, data, results]
  );

  return (
    <div data-cy="search-results-table">
      <MUIDataTable
        // Is a @material-ui property
        // but missing in types
        // @ts-ignore
        innerRef={tableCallbackRef}
        columns={columns}
        data={data}
        options={{
          count,
          download: false,
          filter: false,
          onChangePage,
          onChangeRowsPerPage,
          onColumnSortChange,
          selectableRows: "none",
          serverSide: true,
          setRowProps(_, rowIndex) {
            return {"data-cy": "search-result-" + rowIndex};
          },
        }}
        title={
          <Typography variant="h6" data-cy="title">
            {title}
          </Typography>
        }
      />
    </div>
  );
};
