import {
  Card,
  CardContent,
  List,
  ListItem,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import * as React from "react";
import {KgNodeLink} from "./KgNodeLink";
import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";
import {KgSource} from "shared/models/kg/source/KgSource";

const useStyles = makeStyles(() =>
  createStyles({
    edgeListRoot: {
      margin: "20px",
    },
    edgeListContent: {
      display: "flex",
      flexDirection: "row",
      padding: "0",
      "&:last-child": {
        paddingBottom: "0",
      },
      "& > *": {
        padding: "16px",
      },
      "&:last-child > *": {
        paddingBottom: "24px",
      },
    },
    edgeListTitle: {
      flex: "0 0 16em",
      background: "#F4F4F4",
    },
  })
);

export const KgEdgeObjectsLists: React.FunctionComponent<{
  edgeObjectsByPredicate: {
    [predicate: string]: KgEdgeObject[];
  };
  sources: KgSource[];
}> = ({edgeObjectsByPredicate, sources}) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {Object.keys(edgeObjectsByPredicate).map((predicate) => (
        <Card
          className={classes.edgeListRoot}
          data-cy={`list-${predicate}-edges`}
          key={predicate}
        >
          <CardContent className={classes.edgeListContent}>
            <div className={classes.edgeListTitle} data-cy="edge-list-title">
              <p>{predicate}</p>
            </div>
            <List>
              {edgeObjectsByPredicate[predicate]!.map((edge) => (
                <ListItem data-cy="edge" key={edge.object}>
                  <KgNodeLink node={{...edge.objectNode!, sources}} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </React.Fragment>
  );
};
