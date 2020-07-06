import * as React from "react";

import {KgNode} from "models/kg/KgNode";
import {KgNodeLink} from "components/kg/node/KgNodeLink";
import {KgDatasourceLink} from "components/kg/search/KgDatasourceLink";

import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {Typography} from "@material-ui/core";

const showListAsColumn = (list: string[]) =>
  list.map((item) => (
    <React.Fragment key={item}>
      {item}
      <br />
    </React.Fragment>
  ));

const columns: MUIDataTableColumn[] = [
  {
    name: "#",
    options: {
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
    name: "id",
    options: {
      display: "false",
    },
  },
  {
    name: "label",
    label: "Label",
    options: {
      customBodyRender(_, tableMeta) {
        const nodeRowData = (tableMeta.tableData[
          tableMeta.rowIndex
        ] as unknown) as (string | undefined)[];

        return (
          <KgNodeLink
            node={{
              id: nodeRowData[getPropertyColumnIndex("id")]!,
              label: nodeRowData[getPropertyColumnIndex("label")] || null,
              pos: nodeRowData[getPropertyColumnIndex("pos")] || null,
            }}
          />
        );
      },
    },
  },
  {
    name: "aliases",
    label: "Aliases",
    options: {
      customBodyRender(aliases) {
        return aliases ? showListAsColumn(aliases as string[]) : null;
      },
    },
  },
  {
    name: "datasource",
    label: "Datasources",
    options: {
      customBodyRender(datasources) {
        return datasources
          ? (datasources as string).split(",").map((datasource) => (
              <React.Fragment key={datasource}>
                <KgDatasourceLink datasource={datasource} />
                <br />
              </React.Fragment>
            ))
          : null;
      },
    },
  },
  {
    name: "other",
    label: "Other",
  },
  {
    name: "pos",
    label: "Pos",
    options: {
      customBodyRender(pos) {
        return pos ? showListAsColumn((pos as string).split(",")) : null;
      },
    },
  },
];

const getPropertyColumnIndex = (
  property: Exclude<keyof KgNode, "__typename">
) => {
  return columns.findIndex(
    (col) => typeof col !== "string" && col.name === property
  );
};

export const KgNodeTable: React.FunctionComponent<{
  title: string;
  nodes: KgNode[];
  rowsPerPage: number;
  count: number;
  page: number;
  onChangePage: (newPage: number) => void;
  onChangeRowsPerPage: (newRowsPerPage: number) => void;
}> = ({
  title,
  nodes,
  rowsPerPage,
  count,
  page,
  onChangePage,
  onChangeRowsPerPage,
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
        data={nodes}
        columns={columns}
        options={{
          count,
          serverSide: true,
          sort: false,
          filter: false,
          onChangePage,
          onChangeRowsPerPage,
          setRowProps(_, rowIndex) {
            return {"data-cy": "node-" + rowIndex};
          },
        }}
      />
    </div>
  );
};