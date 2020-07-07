import {KgNodePageQuery_kgById_nodeById_subjectOfEdges} from "kg/api/queries/types/KgNodePageQuery";
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

const EdgeList: React.FunctionComponent<{
  edges: KgNodePageQuery_kgById_nodeById_subjectOfEdges[];
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
              <KgNodeLink node={edge.objectNode!} datasource={datasource} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const KgNodePredicateGrid: React.FunctionComponent<{
  predicateSubjects: {
    [predicate: string]: KgNodePageQuery_kgById_nodeById_subjectOfEdges[];
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
