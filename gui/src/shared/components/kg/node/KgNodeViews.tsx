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
import {KgEdgeObjectsGrid} from "shared/components/kg/node/KgEdgeObjectsGrid";
import {KgEdgeObjectsLists} from "shared/components/kg/node/KgEdgeObjectsLists";
import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";
import {KgSource} from "shared/models/kg/source/KgSource";
import {TabRoute} from "shared/components/route/TabRoute";
import {TabRouteTabs} from "shared/components/route/TabRouteTabs";
import {TabRouteSwitch} from "shared/components/route/TabRouteSwitch";
import {KgNodeSourcesCard} from "shared/components/kg/node/KgNodeSourcesCard";
import {indexKgEdgeObjectsByPredicate} from "shared/models/kg/node/indexKgEdgeObjectsByPredicate";

export const KgNodeViews: React.FunctionComponent<{
  node: {
    aliases: string[] | null;
    id: string;
    label: string | null;
    pos: string | null;
    sources: KgSource[];
    topSubjectOfEdges: KgEdgeObject[];
  };
}> = ({node}) => {
  const routeMatch = useRouteMatch();

  let title = node.label ? node.label : node.id;
  if (node.pos) {
    title += " (" + node.pos + ")";
  }

  const edgeObjectsByPredicate = indexKgEdgeObjectsByPredicate(
    node.topSubjectOfEdges
  );

  const tabRoutes = {
    grid: new TabRoute({
      content: (
        <KgEdgeObjectsGrid
          edgeObjectsByPredicate={edgeObjectsByPredicate}
          sources={node.sources}
        />
      ),
      relPath: "",
      label: "Grid",
      dataCy: "predicate-grid",
      routeMatch,
    }),
    list: new TabRoute({
      content: (
        <KgEdgeObjectsLists
          edgeObjectsByPredicate={edgeObjectsByPredicate}
          sources={node.sources}
        />
      ),
      relPath: "/list",
      label: "List",
      dataCy: "predicate-list",
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
              <KgNodeSourcesCard nodeSources={node.sources} />
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
