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
import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";
import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";
import {KgSource} from "shared/models/kg/source/KgSource";
import {TabRoute} from "shared/components/route/TabRoute";
import {TabRouteTabs} from "shared/components/route/TabRouteTabs";
import {TabRouteSwitch} from "shared/components/route/TabRouteSwitch";

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

  const nodeLabel = node.label ? node.label : node.id;

  let title = nodeLabel;
  if (node.pos) {
    title += " (" + node.pos + ")";
  }

  const edgeObjectsByPredicate: {
    [index: string]: KgEdgeObject[];
  } = {};
  for (const edge of node.topSubjectOfEdges) {
    if (!edge.objectNode) {
      continue;
    } else if (!edge.predicate) {
      continue;
    }
    const edges = (edgeObjectsByPredicate[edge.predicate] =
      edgeObjectsByPredicate[edge.predicate] ?? []);
    edges.push(edge);
  }

  const tabRoutes = {
    grid: new TabRoute({
      content: (
        <KgEdgeObjectsGrid
          edgeObjectsByPredicate={edgeObjectsByPredicate}
          sources={node.sources}
        />
      ),
      relPath: "",
      label: "Predicate Grid",
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
      label: "Predicate List",
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
          <h1 data-cy="node-title">{title}</h1>
          <TabRouteSwitch tabRoutes={Object.values(tabRoutes)} />
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column" spacing={6}>
            <Grid item>
              <Card>
                <CardHeader title="Source(s)"></CardHeader>
                <CardContent>
                  <List>
                    {node.sources.map((source) => (
                      <ListItemText data-cy="node-source">
                        <KgSourcePill source={source} />
                      </ListItemText>
                    ))}
                  </List>
                </CardContent>
              </Card>
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
