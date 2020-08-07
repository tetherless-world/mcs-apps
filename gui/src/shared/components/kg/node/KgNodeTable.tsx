import * as React from "react";

import {KgNode} from "shared/models/kg/node/KgNode";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";
import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";

import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {Typography} from "@material-ui/core";
import {KgSource} from "shared/models/kg/source/KgSource";

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
    name: "sources",
    label: "Sources",
    options: {
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
  count: number;
  nodes: readonly KgNode[];
  onChangePage: (newPage: number) => void;
  onChangeRowsPerPage: (newRowsPerPage: number) => void;
  rowsPerPage: number;
  page: number;
  title: React.ReactNode;
}> = ({
  count,
  nodes,
  onChangePage,
  onChangeRowsPerPage,
  page,
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
        data={nodes.concat()}
        columns={columns}
        options={{
          count,
          serverSide: true,
          sort: false,
          filter: false,
          selectableRows: "none",
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
