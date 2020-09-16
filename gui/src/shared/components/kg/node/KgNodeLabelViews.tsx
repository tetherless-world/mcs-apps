import * as React from "react";
import {useRouteMatch} from "react-router-dom";
import {Grid} from "@material-ui/core";
import {KgNodeContextGrid} from "shared/components/kg/node/KgEdgeObjectsGrid";
import {KgNodeContextLists} from "shared/components/kg/node/KgEdgeObjectsLists";
import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";
import {KgSource} from "shared/models/kg/source/KgSource";
import {TabRoute} from "shared/components/route/TabRoute";
import {TabRouteTabs} from "shared/components/route/TabRouteTabs";
import {TabRouteSwitch} from "shared/components/route/TabRouteSwitch";
import {KgNodeSourcesCard} from "shared/components/kg/node/KgNodeSourcesCard";
import {indexKgEdgeObjectsByPredicate} from "shared/models/kg/node/indexKgEdgeObjectsByPredicate";
import {KgNodeLabel} from "shared/models/kg/node/KgNodeLabel";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgNodeLabelContext} from "shared/models/kg/node/KgNodeLabelContext";

export const KgNodeLabelViews: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodeLabel: KgNodeLabel & {
    context: KgNodeLabelContext;
    sourceIds: readonly string[];
  };
}> = ({allSources, nodeLabel}) => {
  const routeMatch = useRouteMatch();

  const edgeObjectsByPredicate = indexKgEdgeObjectsByPredicate(
    nodeLabel.topEdges
  );

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
          <h1 data-cy="node-title">Node label: {nodeLabel}</h1>
          <TabRouteSwitch tabRoutes={Object.values(tabRoutes)} />
        </Grid>
        <Grid item xs={2}>
          <Grid container direction="column" spacing={6}>
            <Grid item>
              <KgNodeSourcesCard
                nodeSources={nodeLabel.sourceIds.map((sourceId) =>
                  resolveSourceId({allSources, sourceId})
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
