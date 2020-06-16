import * as React from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import {KgPath} from "models/kg/KgPath";

export const KgPathsTable: React.FunctionComponent<{
  paths: KgPath[];
  color: (path: KgPath) => string;
  onClick: (path: KgPath) => void;
}> = ({paths, color, onClick}) => {
  return (
    <TableContainer component={Paper}>
      <Table data-cy="kg-paths-table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Datasource</TableCell>
            <TableCell>Number of Nodes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paths.map((path) => (
            <TableRow
              key={path.id}
              hover
              onClick={() => onClick(path)}
              style={{cursor: "pointer"}}
              data-cy={"path-" + path.id}
            >
              <TableCell>
                <div
                  style={{
                    height: "10px",
                    width: "10px",
                    backgroundColor: color(path),
                  }}
                ></div>
              </TableCell>
              <TableCell>{path.id}</TableCell>
              <TableCell>{path.datasource}</TableCell>
              <TableCell>{path.edges.length + 1}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
