import * as React from "react";
import {useRouteMatch} from "react-router-dom";
import {Grid} from "@material-ui/core";
import {KgEdgeObjectsGrid} from "shared/components/kg/node/KgEdgeObjectsGrid";
import {KgEdgeObjectsLists} from "shared/components/kg/node/KgEdgeObjectsLists";
import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";
import {KgSource} from "shared/models/kg/source/KgSource";
import {TabRoute} from "shared/components/route/TabRoute";
import {TabRouteTabs} from "shared/components/route/TabRouteTabs";
import {TabRouteSwitch} from "shared/components/route/TabRouteSwitch";
import {KgNodeSourcesCard} from "shared/components/kg/node/KgNodeSourcesCard";
import {indexKgEdgeObjectsByPredicate} from "shared/models/kg/node/indexKgEdgeObjectsByPredicate";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";

export const KgNodeLabelViews: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodeLabel: string;
  sourceIds: readonly string[];
  topSubjectOfEdges: readonly KgEdgeObject[];
}> = ({allSources, nodeLabel, sourceIds, topSubjectOfEdges}) => {
  const routeMatch = useRouteMatch();

  const edgeObjectsByPredicate = indexKgEdgeObjectsByPredicate(
    topSubjectOfEdges
  );

  const sources = sourceIds.map((sourceId) =>
    resolveSourceId({allSources, sourceId})
  );

  const tabRoutes = {
    grid: new TabRoute({
      content: (
        <KgEdgeObjectsGrid
          edgeObjectsByPredicate={edgeObjectsByPredicate}
          sources={sources}
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
          sources={sources}
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
          <h1 data-cy="node-title">Node label: {nodeLabel}</h1>
          <TabRouteSwitch tabRoutes={Object.values(tabRoutes)} />
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column" spacing={6}>
            <Grid item>
              <KgNodeSourcesCard nodeSources={sources} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
