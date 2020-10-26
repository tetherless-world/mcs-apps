import * as React from "react";
import {KgSource} from "shared/models/kg/source/KgSource";
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";
import {List, ListItem, ListItemText} from "@material-ui/core";
import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";
import {HrefsContext} from "shared/HrefsContext";

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
  const hrefs = React.useContext<Hrefs>(HrefsContext);

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
        name: "id",
        label: "Identifier",
        options: {
          sort: true,
          customBodyRender(id, tableMeta) {
            return (
              <Link
                data-cy="node-link"
                title={id}
                to={hrefs.kg({id: kgId}).node({id})}
              >
                {id}
              </Link>
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
                {labels.split("|").map((label) => (
                  <ListItem key={label}>
                    <ListItemText>
                      <Link
                        data-cy="node-label-link"
                        title={label}
                        to={hrefs.kg({id: kgId}).nodeLabel({label})}
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
        options: {
          display: nodes.some((node) => !!node.pos),
        },
      },
      {
        name: "pageRank",
        label: "PageRank",
        options: {
          sort: true,
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
    ],
    [allSources, nodes]
  );

  const data: {
    id: string;
    labels: string;
    pageRank: string;
    pos: string | null;
    sourceIds: string;
  }[] = nodes.map((node) => ({
    id: node.id,
    labels: node.labels.join("|"),
    pageRank: node.pageRank.toFixed(2),
    pos: node.pos,
    sourceIds: node.sourceIds.join("|"),
  }));

  return (
    <div data-cy="nodes-table">
      <MUIDataTable
        columns={columns}
        data={data}
        options={{
          download: false,
          rowsPerPage: 15,
          selectableRows: "none",
          setRowProps(_, rowIndex) {
            return {"data-cy": "node-" + rowIndex};
          },
        }}
        title={""}
      />
    </div>
  );
};
