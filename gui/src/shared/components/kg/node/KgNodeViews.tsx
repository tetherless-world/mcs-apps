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
import {KgNodeContextGrid} from "shared/components/kg/node/KgEdgeObjectsGrid";
import {KgNodeContextLists} from "shared/components/kg/node/KgEdgeObjectsLists";
import {KgSource} from "shared/models/kg/source/KgSource";
import {TabRoute} from "shared/components/route/TabRoute";
import {TabRouteTabs} from "shared/components/route/TabRouteTabs";
import {TabRouteSwitch} from "shared/components/route/TabRouteSwitch";
import {KgNodeSourcesCard} from "shared/components/kg/node/KgNodeSourcesCard";
import {indexKgEdgeObjectsByPredicate} from "shared/models/kg/node/indexKgEdgeObjectsByPredicate";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgNodeContext} from "shared/models/kg/node/KgNodeContext";

export const KgNodeViews: React.FunctionComponent<{
  allSources: readonly KgSource[];
  node: {
    aliases: string[] | null;
    context: KgNodeContext;
    id: string;
    label: string | null;
    sourceIds: string[];
    pos: string | null;
  };
}> = ({allSources, node}) => {
  const routeMatch = useRouteMatch();

  let title = node.label ? node.label : node.id;
  if (node.pos) {
    title += " (" + node.pos + ")";
  }

  const edgeObjectsByPredicate = indexKgEdgeObjectsByPredicate(node.context);

  const tabRoutes = {
    grid: new TabRoute({
      content: (
        <KgNodeContextGrid
          allSources={allSources}
          edgeObjectsByPredicate={edgeObjectsByPredicate}
        />
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
          edgeObjectsByPredicate={edgeObjectsByPredicate}
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
            {node.aliases ? (
              <Grid item>
                <Card>
                  <CardHeader title="Aliases" />
                  <CardContent>
                    <List>
                      {[...new Set(node.aliases)].map((alias) => (
                        <ListItemText key={alias}>{alias}</ListItemText>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
