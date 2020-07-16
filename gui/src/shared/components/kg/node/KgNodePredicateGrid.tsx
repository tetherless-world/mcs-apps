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
import {KgNodeSubjectOfEdge} from "shared/models/kg/KgNodeSubjectOfEdge";

const EdgeList: React.FunctionComponent<{
  edges: KgNodeSubjectOfEdge[];
  predicate: string;
  sources: string[];
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
              <KgNodeLink node={edge.objectNode!} sources={sources} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const KgNodePredicateGrid: React.FunctionComponent<{
  predicateSubjects: {
    [predicate: string]: KgNodeSubjectOfEdge[];
  };
  sources: string[];
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
