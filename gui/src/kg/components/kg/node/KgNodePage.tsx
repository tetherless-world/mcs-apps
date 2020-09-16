import * as React from "react";
import {useParams} from "react-router-dom";
import * as NodePageQueryDocument from "kg/api/queries/KgNodePageQuery.graphql";
import {
  KgNodePageQuery,
  KgNodePageQueryVariables,
} from "kg/api/queries/types/KgNodePageQuery";
import {useQuery} from "@apollo/react-hooks";
import {KgFrame} from "kg/components/frame/KgFrame";
import {kgId} from "shared/api/kgId";
import {NotFound} from "shared/components/error/NotFound";
import {KgNodeViews} from "shared/components/kg/node/KgNodeViews";
import {KgEdgeObject} from "shared/models/kg/node/KgEdgeObject";
import {KgNodeLabel} from "shared/models/kg/node/KgNodeLabel";

export const KgNodePage: React.FunctionComponent = () => {
  let {nodeId} = useParams<{nodeId: string}>();
  nodeId = decodeURIComponent(nodeId);

  const query = useQuery<KgNodePageQuery, KgNodePageQueryVariables>(
    NodePageQueryDocument,
    {variables: {kgId, nodeId}}
  );

  return (
    <KgFrame<KgNodePageQuery> {...query}>
      {({data}) => {
        const node = data.kgById.node;
        if (!node) {
          return <NotFound label={nodeId} />;
        }

        return (
          <KgNodeViews
            allSources={data.kgById.sources}
            node={{...node, topEdges: node.context.topEdges}}
          />
        );
      }}
    </KgFrame>
  );
};
