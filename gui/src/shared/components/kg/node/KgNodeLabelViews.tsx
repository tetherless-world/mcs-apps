import * as React from "react";
import {useRouteMatch} from "react-router-dom";
import {Grid} from "@material-ui/core";
import {KgNodeContextEdgesGrid} from "shared/components/kg/node/KgNodeContextEdgesGrid";
import {KgSource} from "shared/models/kg/source/KgSource";
import {TabRoute} from "shared/components/route/TabRoute";
import {TabRouteTabs} from "shared/components/route/TabRouteTabs";
import {TabRouteSwitch} from "shared/components/route/TabRouteSwitch";
import {KgNodeSourcesCard} from "shared/components/kg/node/KgNodeSourcesCard";
import {resolveSourceId} from "shared/models/kg/source/resolveSourceId";
import {KgNodeLabelContext} from "shared/models/kg/node/KgNodeLabelContext";
import {KgNodesTable} from "shared/components/kg/node/KgNodesTable";

export const KgNodeLabelViews: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodeLabel: {
    context: KgNodeLabelContext;
    nodeLabel: string;
    nodes: {
      id: string;
      labels: readonly string[];
      pageRank: number;
      pos: string | null;
      sourceIds: readonly string[];
    }[];
    pageRank: number;
    sourceIds: readonly string[];
  };
}> = ({allSources, nodeLabel}) => {
  const routeMatch = useRouteMatch();

  const tabRoutes = {
    grid: new TabRoute({
      content: (
        <KgNodeContextEdgesGrid
          allSources={allSources}
          nodeContext={nodeLabel.context}
        />
      ),
      relPath: "",
      label: "Edges",
      dataCy: "edges",
      routeMatch,
    }),
    nodes: new TabRoute({
      content: <KgNodesTable allSources={allSources} nodes={nodeLabel.nodes} />,
      relPath: "/nodes",
      label: "nodes",
      dataCy: "nodes",
      routeMatch,
    }),
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <TabRouteTabs tabRoutes={Object.values(tabRoutes)} />
      </Grid>
      <Grid item container spacing={4}>
        <Grid item xs={10}>
          <h1 data-cy="node-label-title">Node label: {nodeLabel.nodeLabel}</h1>
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
