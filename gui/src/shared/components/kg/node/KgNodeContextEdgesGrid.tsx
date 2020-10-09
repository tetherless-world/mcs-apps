import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemText,
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

export const KgNodeContextEdgesGrid: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodeContext: KgNodeContext;
}> = ({allSources, nodeContext}) => {
  const nodeLabelsByTopEdgePredicate = indexNodeContextByTopEdgePredicate(
    nodeContext
  );
  return (
    <Grid container spacing={4}>
      {Object.keys(nodeLabelsByTopEdgePredicate).map((predicate) => (
        <Grid item key={predicate} data-cy={`grid-${predicate}-edges`}>
          <Card>
            <CardHeader
              data-cy="edge-list-title"
              title={predicate}
              style={{textAlign: "center"}}
            />
            <CardContent>
              <List>
                {nodeLabelsByTopEdgePredicate[predicate]!.map((nodeLabel) => {
                  return (
                    <ListItem key={nodeLabel.nodeLabel}>
                      <ListItemText>
                        <Link
                          data-cy="node-label-link"
                          title={nodeLabel.nodeLabel}
                          to={Hrefs.kg({id: kgId}).nodeLabel({
                            label: nodeLabel.nodeLabel,
                          })}
                        >
                          <span style={{marginRight: "5px"}}>
                            {nodeLabel.nodeLabel}
                          </span>
                        </Link>
                        {resolveSourceIds({
                          allSources,
                          sourceIds: nodeLabel.sourceIds,
                        }).map((source) => (
                          <KgSourcePill
                            idOnly={true}
                            key={source.id}
                            source={source}
                            size="small"
                          />
                        ))}
                      </ListItemText>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
