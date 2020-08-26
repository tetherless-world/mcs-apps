import * as React from "react";
import {useParams} from "react-router-dom";
import * as NodeLabelPageQueryDocument from "kg/api/queries/KgNodeLabelPageQuery.graphql";
import {
  KgNodeLabelPageQuery,
  KgNodeLabelPageQueryVariables,
} from "kg/api/queries/types/KgNodeLabelPageQuery";
import {useQuery} from "@apollo/react-hooks";
import {KgFrame} from "kg/components/frame/KgFrame";
import {kgId} from "shared/api/kgId";
import {List, ListItem, ListItemText} from "@material-ui/core";
import {KgNodeLink} from "shared/components/kg/node/KgNodeLink";

export const KgNodeLabelPage: React.FunctionComponent = () => {
  let {nodeLabel} = useParams<{nodeLabel: string}>();
  nodeLabel = decodeURIComponent(nodeLabel);

  const query = useQuery<KgNodeLabelPageQuery, KgNodeLabelPageQueryVariables>(
    NodeLabelPageQueryDocument,
    {variables: {kgId, nodeLabel}}
  );

  return (
    <KgFrame<KgNodeLabelPageQuery> {...query}>
      {({data}) => {
        const nodes = data.kgById.nodesByLabel;
        return (
          <List>
            {nodes.map((node) => (
              <ListItem key={node.id}>
                <ListItemText>
                  <KgNodeLink node={node} sources={[]} />
                </ListItemText>
              </ListItem>
            ))}
          </List>
        );
      }}
    </KgFrame>
  );
};
