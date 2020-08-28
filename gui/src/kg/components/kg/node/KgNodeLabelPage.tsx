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
        return (
          <KgNodeLabelViews
            allSources={data.kgById.sources}
            nodeLabel={nodeLabel}
            sourceIds={data.kgById.nodesByLabel.sourceIds}
            topSubjectOfEdges={data.kgById.nodesByLabel.topSubjectOfEdges}
          />
        );
      }}
    </KgFrame>
  );
};
