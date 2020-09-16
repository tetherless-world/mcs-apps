import {
  Card,
  CardContent,
  createStyles,
  List,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import * as React from "react";
import {KgSource} from "shared/models/kg/source/KgSource";
import {KgNodeContext} from "shared/models/kg/node/KgNodeContext";
import {indexNodeContextByTopEdgePredicate} from "shared/models/kg/node/indexNodeContextByTopEdgePredicate";

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

export const KgNodeContextLists: React.FunctionComponent<{
  allSources: readonly KgSource[];
  nodeContext: KgNodeContext;
}> = ({allSources, nodeContext}) => {
  const nodeLabelsByTopEdgePredicate = indexNodeContextByTopEdgePredicate(
    nodeContext
  );

  const classes = useStyles();
  return (
    <React.Fragment>
      {Object.keys(nodeLabelsByTopEdgePredicate).map((predicate) => (
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
              {nodeLabelsByTopEdgePredicate[predicate]!.map((nodeLabel) => (
                <ListItem data-cy="edge" key={nodeLabel.nodeLabel}>
                  {nodeLabel.nodeLabel}
                  {/*<KgNodeLink node={{...edge.objectNode!, allSources}} />*/}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </React.Fragment>
  );
};
