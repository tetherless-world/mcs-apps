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
import {KgNodeLabelViews} from "shared/components/kg/node/KgNodeLabelViews";
import {KgNoRoute} from "kg/components/error/KgNoRoute";

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
        const nodeLabel = data.kgById.nodeLabel;
        if (!nodeLabel) {
          return <KgNoRoute />;
        }

        return (
          <KgNodeLabelViews
            allSources={data.kgById.sources}
            nodeLabel={nodeLabel}
          />
        );
      }}
    </KgFrame>
  );
};
