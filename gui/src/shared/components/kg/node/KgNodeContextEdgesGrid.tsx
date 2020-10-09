import {
  Card,
  CardContent,
  CardHeader,
  createMuiTheme,
  Grid,
  List,
  ListItem,
  ThemeProvider,
} from "@material-ui/core";
import * as React from "react";
import {KgSource} from "shared/models/kg/source/KgSource";
import {
  KgNodeContext,
  KgNodeContextRelatedNodeLabel,
} from "shared/models/kg/node/KgNodeContext";
import {resolveSourceIds} from "shared/models/kg/source/resolveSourceIds";
import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";
import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";
import MUIDataTable, {MUIDataTableColumnDef} from "mui-datatables";

const indexNodeContextByTopEdgePredicate = (
  nodeContext: KgNodeContext
): {[index: string]: readonly KgNodeContextRelatedNodeLabel[]} => {
  const relatedNodeLabelsByNodeId: {
    [index: string]: KgNodeContextRelatedNodeLabel[];
  } = {};
  for (const relatedNodeLabel of nodeContext.relatedNodeLabels) {
    for (const nodeId of relatedNodeLabel.nodeIds) {
      let relatedNodeLabels = relatedNodeLabelsByNodeId[nodeId];
      if (!relatedNodeLabels) {
        relatedNodeLabels = relatedNodeLabelsByNodeId[nodeId] = [];
      }
      relatedNodeLabels.push(relatedNodeLabel);
    }
  }

  const result: {[index: string]: KgNodeContextRelatedNodeLabel[]} = {};
  for (const topEdge of nodeContext.topEdges) {
    let predicateNodeLabels = result[topEdge.predicate];
    if (!predicateNodeLabels) {
      predicateNodeLabels = result[topEdge.predicate] = [];
    }
    const objectNodeLabels = relatedNodeLabelsByNodeId[topEdge.object];
    if (!objectNodeLabels) {
      continue;
    }
    for (const objectNodeLabel of objectNodeLabels) {
      if (
        predicateNodeLabels.some(
          (predicateNodeLabel) =>
            predicateNodeLabel.nodeLabel == objectNodeLabel.nodeLabel
        )
      ) {
        // Ignore duplicates
        continue;
      }
      predicateNodeLabels.push(objectNodeLabel);
    }
    predicateNodeLabels.sort((left, right) => left.pageRank - right.pageRank);
  }

  return result;
};

const theme = createMuiTheme({
  overrides: {
    MUIDataTableToolbar: {
      root: {
        display: "none",
      },
    },
  } as any,
});

export const KgNodeContextEdgesGrid: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodeContext: KgNodeContext;
}> = ({allSources, nodeContext}) => {
  const nodeLabelsByTopEdgePredicate = indexNodeContextByTopEdgePredicate(
    nodeContext
  );

  const topEdgeColumns: MUIDataTableColumnDef[] = [
    {
      name: "nodeLabel",
      options: {
        customBodyRender(nodeLabel: string) {
          return (
            <Link
              data-cy="node-label-link"
              title={nodeLabel}
              to={Hrefs.kg({id: kgId}).nodeLabel({
                label: nodeLabel,
              })}
            >
              <span style={{marginRight: "5px"}}>{nodeLabel}</span>
            </Link>
          );
        },
        customHeadRender: () => null,
      },
    },
    {
      name: "sourceIds",
      options: {
        customBodyRender(value: string, tableMeta) {
          // const nodeLabel: string = tableMeta.rowData[0];
          const sources = resolveSourceIds({
            allSources,
            sourceIds: value.split("|"),
          });
          return (
            <List>
              <ListItem>
                {sources.map((source) => (
                  <KgSourcePill
                    idOnly={true}
                    key={source.id}
                    source={source}
                    size="small"
                  />
                ))}
              </ListItem>
            </List>
          );
        },
        customHeadRender: () => null,
      },
    },
  ];

  return (
    <Grid container spacing={4}>
      {Object.keys(nodeLabelsByTopEdgePredicate).map((predicate) => {
        const data: {
          nodeLabel: string;
          sourceIds: string;
        }[] = nodeLabelsByTopEdgePredicate[predicate]!.map((nodeLabel) => ({
          nodeLabel: nodeLabel.nodeLabel,
          sourceIds: nodeLabel.sourceIds.join("|"),
        }));

        return (
          <Grid item key={predicate} data-cy={`grid-${predicate}-edges`}>
            <Card>
              <CardHeader
                data-cy="edge-list-title"
                title={predicate}
                style={{textAlign: "center"}}
              />
              <CardContent>
                <ThemeProvider theme={theme}>
                  <MUIDataTable
                    columns={topEdgeColumns}
                    data={data}
                    options={{
                      fixedHeader: false,
                      fixedSelectColumn: false,
                      pagination: data.length > 10,
                      selectableRows: "none",
                    }}
                    title={""}
                  />
                </ThemeProvider>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};
