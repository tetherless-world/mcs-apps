import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import {KgFrame} from "kg/components/frame/KgFrame";
import {RandomKgNodePageQuery} from "kg/api/queries/types/RandomKgNodePageQuery";
import * as RandomKgNodePageQueryDocument from "kg/api/queries/RandomKgNodePageQuery.graphql";
import {useHistory} from "react-router-dom";
import {kgId} from "shared/api/kgId";
import {Hrefs} from "shared/Hrefs";
import {HrefsContext} from "shared/HrefsContext";

export const RandomKgNodePage: React.FunctionComponent = () => {
  const query = useQuery<RandomKgNodePageQuery>(RandomKgNodePageQueryDocument, {
    variables: {kgId},
  });

  const history = useHistory();
  const hrefs = React.useContext<Hrefs>(HrefsContext);

  return (
    <KgFrame<RandomKgNodePageQuery> {...query}>
      {({data}) => {
        const randomNodeId = data.kgById.randomNode.id;
        history.push(hrefs.kg({id: kgId}).node({id: randomNodeId}));
        return <React.Fragment />;
      }}
    </KgFrame>
  );
};
