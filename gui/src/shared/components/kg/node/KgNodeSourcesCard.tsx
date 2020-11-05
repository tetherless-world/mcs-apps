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
import {kgId} from "shared/api/kgId";
import {useHistory} from "react-router-dom";
import {Hrefs} from "shared/Hrefs";
import {HrefsContext} from "shared/HrefsContext";

export const KgNodeSourcesCard: React.FunctionComponent<{
  nodeSources: readonly KgSource[];
}> = ({nodeSources}) => {
  const history = useHistory();
  const hrefs = React.useContext<Hrefs>(HrefsContext);

  return (
    <Card>
      <CardHeader title="Source(s)"></CardHeader>
      <CardContent>
        <List>
          {nodeSources.map((source) => (
            <ListItemText data-cy="node-source" key={source.id}>
              <KgSourcePill
                onClick={() => {
                  history.push(
                    hrefs.kg({id: kgId}).source({sourceId: source.id})
                  );
                }}
                source={source}
              />
            </ListItemText>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
