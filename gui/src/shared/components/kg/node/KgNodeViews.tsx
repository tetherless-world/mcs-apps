import * as React from "react";
import {useRouteMatch} from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItemText,
} from "@material-ui/core";
import {KgNodeContextGrid} from "shared/components/kg/node/KgNodeContextGrid";
import {KgNodeContextLists} from "shared/components/kg/node/KgNodeContextLists";
import {KgSource} from "shared/models/kg/source/KgSource";
import {TabRoute} from "shared/components/route/TabRoute";
import {TabRouteTabs} from "shared/components/route/TabRouteTabs";
import {TabRouteSwitch} from "shared/components/route/TabRouteSwitch";
import {KgNodeSourcesCard} from "shared/components/kg/node/KgNodeSourcesCard";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgNodeContext} from "shared/models/kg/node/KgNodeContext";
import {getPreferredKgNodeLabel} from "shared/models/kg/node/getPreferredKgNodeLabel";

export const KgNodeViews: React.FunctionComponent<{
  allSources: readonly KgSource[];
  node: {
    context: KgNodeContext;
    id: string;
    labels: readonly string[];
    sourceIds: readonly string[];
    pos: string | null;
  };
}> = ({allSources, node}) => {
  const routeMatch = useRouteMatch();

  let title = getPreferredKgNodeLabel(node);
  if (node.pos) {
    title += " (" + node.pos + ")";
  }

  const tabRoutes = {
    grid: new TabRoute({
      content: (
        <KgNodeContextGrid allSources={allSources} nodeContext={node.context} />
      ),
      relPath: "",
      label: "Grid",
      dataCy: "edge-objects-grid",
      routeMatch,
    }),
    list: new TabRoute({
      content: (
        <KgNodeContextLists
          allSources={allSources}
          nodeContext={node.context}
        />
      ),
      relPath: "/list",
      label: "List",
      dataCy: "edge-objects-list",
      routeMatch,
    }),
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <TabRouteTabs tabRoutes={Object.values(tabRoutes)} />
      </Grid>
      <Grid item container>
        <Grid item xs={10}>
          <h1 data-cy="node-title">Node: {title}</h1>
          <TabRouteSwitch tabRoutes={Object.values(tabRoutes)} />
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column" spacing={6}>
            <Grid item>
              <KgNodeSourcesCard
                nodeSources={node.sourceIds.map((sourceId) =>
                  resolveSourceId({allSources, sourceId})
                )}
              />
            </Grid>
            <Grid item>
              <Card>
                <CardHeader title="Labels" />
                <CardContent>
                  <List>
                    {[...new Set(node.labels)].map((label) => (
                      <ListItemText key={label}>{label}</ListItemText>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
