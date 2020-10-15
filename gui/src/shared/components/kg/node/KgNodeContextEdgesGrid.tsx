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
  KgNodeContextTopEdge,
} from "shared/models/kg/node/KgNodeContext";
import {resolveSourceIds} from "shared/models/kg/source/resolveSourceIds";
import {Link} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {kgId} from "shared/api/kgId";
import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";
import MUIDataTable, {MUIDataTableColumnDef} from "mui-datatables";

const theme = createMuiTheme({
  overrides: {
    MUIDataTableToolbar: {
      root: {
        display: "none",
      },
    },
  } as any,
});

// for (const objectNodeLabel of objectNodeLabels) {
//   if (
//     predicateNodeLabels.some(
//       (predicateNodeLabel) =>
//         predicateNodeLabel.nodeLabel == objectNodeLabel.nodeLabel
//     )
//   ) {
//     // Ignore duplicates
//     continue;
//   }
//   predicateNodeLabels.push(objectNodeLabel);
// }
// predicateNodeLabels.sort((left, right) => left.pageRank - right.pageRank);

export const KgNodeContextEdgesGrid: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodeContext: KgNodeContext;
}> = ({allSources, nodeContext}) => {
  const relatedNodeLabelsByNodeId: {
    [index: string]: KgNodeContextRelatedNodeLabel[];
  } = React.useMemo(() => {
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
    return relatedNodeLabelsByNodeId;
  }, [nodeContext]);

  const topEdgesByPredicate: {
    [index: string]: KgNodeContextTopEdge[];
  } = React.useMemo(() => {
    const topEdgesByPredicate: {
      [index: string]: KgNodeContextTopEdge[];
    } = {};
    for (const topEdge of nodeContext.topEdges) {
      let topEdges = topEdgesByPredicate[topEdge.predicate];
      if (!topEdges) {
        topEdges = topEdgesByPredicate[topEdge.predicate] = [];
      }
      topEdges.push(topEdge);
    }
    return topEdgesByPredicate;
  }, [nodeContext]);

  const predicateLabelMappings = nodeContext.predicateLabelMappings.reduce(
    (map, mapping) => {
      map[mapping.predicate] = mapping.label;
      return map;
    },
    {} as {[index: string]: string}
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
      {Object.keys(topEdgesByPredicate)
        .sort()
        .map((predicate) => {
          const data: {
            nodeLabel: string;
            nodeLabelPageRank: number;
            sourceIds: string;
          }[] = [];

          for (const topEdge of topEdgesByPredicate[predicate]) {
            const nodeLabels = relatedNodeLabelsByNodeId[topEdge.object];
            if (!nodeLabels) {
              console.error("no node label for node id " + topEdge.object);
              continue;
            }

            for (const nodeLabel of nodeLabels) {
              if (
                data.some((datum) => datum.nodeLabel === nodeLabel.nodeLabel)
              ) {
                // Don't add the same node label twice.
                continue;
              }

              data.push({
                nodeLabel: nodeLabel.nodeLabel,
                nodeLabelPageRank: nodeLabel.pageRank,
                sourceIds: topEdge.sourceIds.join("|"),
              });
            }
          }

          data.sort(
            (left, right) => left.nodeLabelPageRank - right.nodeLabelPageRank
          );

          return (
            <Grid item key={predicate} data-cy={`grid-${predicate}-edges`}>
              <Card>
                <CardHeader
                  data-cy="edge-list-title"
                  title={predicateLabelMappings[predicate] ?? predicate}
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
