import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import {Frame} from "kg/components/frame/Frame";
import {RandomKgNodePageQuery} from "kg/api/queries/types/RandomKgNodePageQuery";
import * as RandomKgNodePageQueryDocument from "kg/api/queries/RandomKgNodePageQuery.graphql";
import {Hrefs} from "kg/Hrefs";
import {useHistory} from "react-router-dom";
import {kgId} from "kg/api/kgId";

export const RandomKgNodePage: React.FunctionComponent = () => {
  const query = useQuery<RandomKgNodePageQuery>(RandomKgNodePageQueryDocument, {
    variables: {kgId},
  });

  const history = useHistory();

  return (
    <Frame {...query}>
      {({data}) => {
        const randomNodeId = data.kgById.randomNode.id;
        history.push(Hrefs.kg({id: kgId}).node({id: randomNodeId}));
        return <React.Fragment />;
      }}
    </Frame>
  );
};
