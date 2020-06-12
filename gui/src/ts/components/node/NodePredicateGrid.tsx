import {NodePageQuery_kg_nodeById_subjectOfEdges} from "api/queries/types/NodePageQuery";
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  Grid,
} from "@material-ui/core";
import * as React from "react";
import {NodeLink} from "./NodeLink";

const EdgeList: React.FunctionComponent<{
  edges: NodePageQuery_kg_nodeById_subjectOfEdges[];
  predicate: string;
  datasource: string;
}> = ({edges, predicate, datasource}) => {
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
              <NodeLink node={edge.objectNode!} datasource={datasource} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const NodePredicateGrid: React.FunctionComponent<{
  predicateSubjects: {
    [predicate: string]: NodePageQuery_kg_nodeById_subjectOfEdges[];
  };
  datasource: string;
}> = ({predicateSubjects, datasource}) => {
  return (
    <Grid container spacing={4}>
      {Object.keys(predicateSubjects).map((predicate) => (
        <Grid item key={predicate} data-cy={`grid-${predicate}-edges`}>
          <EdgeList
            edges={predicateSubjects[predicate]!}
            predicate={predicate}
            datasource={datasource}
          />
        </Grid>
      ))}
    </Grid>
  );
};
