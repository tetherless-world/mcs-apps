import {NodePageQuery_nodeById_subjectOfEdges} from "api/queries/types/NodePageQuery";
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

const EDGE_PREDICATE_DISPLAY_NAMES: {[index: string]: string} = {};

const EdgeList: React.FunctionComponent<{
  edges: NodePageQuery_nodeById_subjectOfEdges[];
  predicate: string;
}> = ({edges, predicate}) => {
  let title = EDGE_PREDICATE_DISPLAY_NAMES[predicate];
  if (!title) {
    title = predicate;
  }
  return (
    <Card>
      <CardHeader
        data-cy="edge-list-title"
        title={title}
        style={{textAlign: "center"}}
      />
      <CardContent>
        <List>
          {edges.map((edge) => (
            <ListItem data-cy="edge" key={edge.object}>
              <NodeLink node={edge.objectNode!} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const NodePredicateGrid: React.FunctionComponent<{
  predicateSubjects: {
    [predicate: string]: NodePageQuery_nodeById_subjectOfEdges[];
  };
}> = ({predicateSubjects}) => {
  return (
    <Grid container spacing={4}>
      {Object.keys(predicateSubjects).map((predicate) => (
        <Grid item key={predicate} data-cy={predicate + "-edges"}>
          <EdgeList
            edges={predicateSubjects[predicate]!}
            predicate={predicate}
          />
        </Grid>
      ))}
    </Grid>
  );
};
