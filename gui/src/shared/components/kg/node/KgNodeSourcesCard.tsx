import {KgSource} from "shared/models/kg/source/KgSource";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItemText,
} from "@material-ui/core";
import {KgSourcePill} from "shared/components/kg/source/KgSourcePill";
import * as React from "react";

export const KgNodeSourcesCard: React.FunctionComponent<{
  nodeSources: readonly KgSource[];
}> = ({nodeSources}) => (
  <Card>
    <CardHeader title="Source(s)"></CardHeader>
    <CardContent>
      <List>
        {nodeSources.map((source) => (
          <ListItemText data-cy="node-source">
            <KgSourcePill source={source} />
          </ListItemText>
        ))}
      </List>
    </CardContent>
  </Card>
);
