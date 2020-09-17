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
import {KgNodeContext} from "shared/models/kg/node/KgNodeContext";
import {indexNodeContextByTopEdgePredicate} from "shared/models/kg/node/indexNodeContextByTopEdgePredicate";
import {KgNodeLabelLink} from "shared/components/kg/node/KgNodeLabelLink";
import {resolveSourceIds} from "shared/models/kg/source/resolveSourceIds";

export const KgNodeContextGrid: React.FunctionComponent<{
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
                        <KgNodeLabelLink
                          nodeLabel={{
                            ...nodeLabel,
                            sources: resolveSourceIds({
                              allSources,
                              sourceIds: nodeLabel.sourceIds,
                            }),
                          }}
                        />
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
