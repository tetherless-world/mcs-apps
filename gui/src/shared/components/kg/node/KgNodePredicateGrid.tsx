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

const EdgeList: React.FunctionComponent<{
  edges: KgEdgeObject[];
  predicate: string;
  sources: KgSource[];
}> = ({edges, predicate, sources}) => {
  return (
    <Card>
      <CardHeader
        data-cy="edge-list-title"
        title={predicate}
        style={{textAlign: "center"}}
      />
      <CardContent>
        <List>
          {edges.map((edge) => (
            <ListItem data-cy="edge" key={edge.object}>
              <KgNodeLink node={{...edge.objectNode!, sources}} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const KgNodePredicateGrid: React.FunctionComponent<{
  predicateSubjects: {
    [predicate: string]: KgEdgeObject[];
  };
  sources: KgSource[];
}> = ({predicateSubjects, sources}) => {
  return (
    <Grid container spacing={4}>
      {Object.keys(predicateSubjects).map((predicate) => (
        <Grid item key={predicate} data-cy={`grid-${predicate}-edges`}>
          <EdgeList
            edges={predicateSubjects[predicate]!}
            predicate={predicate}
            sources={sources}
          />
        </Grid>
      ))}
    </Grid>
  );
};
