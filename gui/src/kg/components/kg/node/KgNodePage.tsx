import * as React from "react";
import {useParams} from "react-router-dom";
import * as NodePageQueryDocument from "kg/api/queries/KgNodePageQuery.graphql";
import {
  KgNodePageQuery,
  KgNodePageQueryVariables,
} from "kg/api/queries/types/KgNodePageQuery";
import {useQuery} from "@apollo/react-hooks";
import {Frame} from "kg/components/frame/Frame";
import {kgId} from "shared/api/kgId";
import {NotFound} from "shared/components/error/NotFound";
import {KgNodeViews} from "shared/components/kg/node/KgNodeViews";

export const KgNodePage: React.FunctionComponent = () => {
  let {nodeId} = useParams<{nodeId: string}>();
  nodeId = decodeURIComponent(nodeId);

  const query = useQuery<KgNodePageQuery, KgNodePageQueryVariables>(
    NodePageQueryDocument,
    {variables: {kgId, nodeId}}
  );

  return (
    <Frame {...query}>
      {({data}) => {
        const node = data.kgById.nodeById;
        if (!node) {
          return <NotFound label={nodeId} />;
        }

        return <KgNodeViews node={node} />;
      }}
    </Frame>
  );
};
