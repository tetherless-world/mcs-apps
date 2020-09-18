import * as React from "react";
import {KgSource} from "shared/models/kg/source/KgSource";
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";
import {List, ListItem, ListItemText} from "@material-ui/core";
import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";

export const KgNodesTable: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodes: {
    id: string;
    labels: readonly string[];
    pageRank: number;
    pos: string | null;
    sourceIds: readonly string[];
  }[];
}> = ({allSources, nodes}) => {
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
        name: "labels",
        label: "Labels",
        options: {
          sort: true,
          customBodyRender(labels, tableMeta) {
            return (
              <List>
                {(labels as string[]).map((label) => (
                  <ListItem key={label}>
                    <ListItemText>
                      <Link
                        data-cy="node-label-link"
                        title={label}
                        to={Hrefs.kg({id: kgId}).nodeLabel({label})}
                      >
                        {label}
                      </Link>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            );
          },
        },
      },
      {
        name: "pos",
        label: "Part of speech",
      },
      {
        name: "pageRank",
        label: "PageRank",
        options: {
          sort: true,
          customBodyRender(pageRank) {
            return (pageRank as number).toFixed(3);
          },
        },
      },
      {
        name: "sourceIds",
        label: "Sources",
        options: {
          sort: true,
          customBodyRender(sourceIds, tableMeta) {
            return sourceIds
              ? (sourceIds as string[])
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
    ],
    [allSources, nodes]
  );

  return (
    <div data-cy="nodes-table">
      <MUIDataTable
        columns={columns}
        data={nodes}
        options={{
          selectableRows: "none",
          setRowProps(_, rowIndex) {
            return {"data-cy": "node-" + rowIndex};
          },
        }}
        title={"Nodes"}
      />
    </div>
  );
};
