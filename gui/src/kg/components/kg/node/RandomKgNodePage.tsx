import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import {KgFrame} from "kg/components/frame/KgFrame";
import {RandomKgNodePageQuery} from "kg/api/queries/types/RandomKgNodePageQuery";
import * as RandomKgNodePageQueryDocument from "kg/api/queries/RandomKgNodePageQuery.graphql";
import {KgHrefs} from "kg/KgHrefs";
import {useHistory} from "react-router-dom";
import {kgId} from "shared/api/kgId";

export const RandomKgNodePage: React.FunctionComponent = () => {
  const query = useQuery<RandomKgNodePageQuery>(RandomKgNodePageQueryDocument, {
    variables: {kgId},
  });

  const history = useHistory();

  return (
    <KgFrame {...query}>
      {({data}) => {
        const randomNodeId = data.kgById.randomNode.id;
        history.push(KgHrefs.kg({id: kgId}).node({id: randomNodeId}));
        return <React.Fragment />;
      }}
    </KgFrame>
  );
};
