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
import {KgNodeLink} from "../node/KgNodeLink";

export const KgPathTable: React.FunctionComponent<{
  path: KgPath;
}> = ({path}) => {
  return (
    <TableContainer component={Paper}>
      <Table data-cy="kg-path-table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Predicate</TableCell>
            <TableCell>Object</TableCell>
            <TableCell>Datasource</TableCell>
            <TableCell>Weight</TableCell>
            <TableCell>Other</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {path.edges.map((edge, index) => (
            <TableRow
              key={
                edge.objectNode.id +
                "-" +
                edge.predicate +
                " " +
                edge.subjectNode.id
              }
              data-cy={"edge-" + index}
            >
              <TableCell>{index}</TableCell>
              <TableCell>
                <KgNodeLink
                  node={edge.subjectNode}
                  datasource={edge.subjectNode.datasource}
                />
              </TableCell>
              <TableCell>{edge.predicate}</TableCell>
              <TableCell>
                <KgNodeLink
                  node={edge.objectNode}
                  datasource={edge.objectNode.datasource}
                />
              </TableCell>
              <TableCell>{edge.datasource}</TableCell>
              <TableCell>{edge.weight}</TableCell>
              <TableCell>{edge.other}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
