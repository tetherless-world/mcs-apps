import * as React from "react";

import {
  Paper,
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  TableBody,
} from "@material-ui/core";

import {KgNode} from "models/kg/KgNode";
import {KgNodeLink} from "components/kg/node/KgNodeLink";
import TablePaginationActions from "@material-ui/core/TablePagination/TablePaginationActions";
import {KgDatasourceLink} from "components/kg/search/KgDatasourceLink";

const showListAsColumn = (list: string[]) =>
  list.map((item) => (
    <React.Fragment key={item}>
      {item}
      <br />
    </React.Fragment>
  ));

export const KgNodeTable: React.FunctionComponent<{
  nodes: KgNode[];
  rowsPerPage: number;
  count: number;
  page: number;
  onChangePage: (newPage: number) => void;
  onChangeRowsPerPage: (newRowsPerPage: number) => void;
}> = ({nodes, rowsPerPage, count, page, onChangePage, onChangeRowsPerPage}) => {
  return (
    <TableContainer component={Paper}>
      <Table data-cy="matchingNodesTable">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Label</TableCell>
            <TableCell>Aliases</TableCell>
            <TableCell>Datasource</TableCell>
            <TableCell>Other</TableCell>
            <TableCell>Pos</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodes.map((node, index) => (
            <TableRow key={node.id}>
              <TableCell>{page * rowsPerPage + index + 1}</TableCell>
              <TableCell>
                <KgNodeLink node={node} />
              </TableCell>
              <TableCell>
                {node.aliases && showListAsColumn(node.aliases)}
              </TableCell>
              <TableCell>
                {node.datasource &&
                  node.datasource.split(",").map((datasource) => (
                    <React.Fragment key={datasource}>
                      <KgDatasourceLink datasource={datasource} />
                      <br />
                    </React.Fragment>
                  ))}
              </TableCell>
              <TableCell>{node.other}</TableCell>
              <TableCell>
                {node.pos && showListAsColumn(node.pos.split(","))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TablePagination
            rowsPerPage={rowsPerPage}
            count={count}
            page={page}
            onChangePage={(_, newPage) => onChangePage(newPage)}
            onChangeRowsPerPage={(event) =>
              onChangeRowsPerPage(+event.target.value)
            }
            ActionsComponent={TablePaginationActions}
          />
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
