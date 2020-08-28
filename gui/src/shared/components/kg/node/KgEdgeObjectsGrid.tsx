import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  Grid,
} from "@material-ui/core";
import * as React from "react";
import {KgNodeLink} from "./KgNodeLink";
import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";
import {KgSource} from "shared/models/kg/source/KgSource";

export const KgEdgeObjectsGrid: React.FunctionComponent<{
  edgeObjectsByPredicate: {
    [predicate: string]: KgEdgeObject[];
  };
  sources: KgSource[];
}> = ({edgeObjectsByPredicate, sources}) => {
  return (
    <Grid container spacing={4}>
      {Object.keys(edgeObjectsByPredicate).map((predicate) => (
        <Grid item key={predicate} data-cy={`grid-${predicate}-edges`}>
          <Card>
            <CardHeader
              data-cy="edge-list-title"
              title={predicate}
              style={{textAlign: "center"}}
            />
            <CardContent>
              <List>
                {edgeObjectsByPredicate[predicate]!.map((edge) => (
                  <ListItem data-cy="edge" key={edge.object}>
                    <KgNodeLink node={{...edge.objectNode!, sources}} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
