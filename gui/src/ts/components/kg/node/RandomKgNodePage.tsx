import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import * as ReactLoader from "react-loader";
import {Frame} from "components/frame/Frame";
import {RandomKgNodePageQuery} from "api/queries/kg/types/RandomKgNodePageQuery";
import * as RandomKgNodePageQueryDocument from "api/queries/kg/RandomKgNodePageQuery.graphql";
import {Hrefs} from "Hrefs";
import {useHistory} from "react-router-dom";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import {kgId} from "api/kgId";

export const RandomKgNodePage: React.FunctionComponent = () => {
  const {data, error, loading} = useQuery<RandomKgNodePageQuery>(
    RandomKgNodePageQueryDocument,
    {variables: {kgId}}
  );

  const history = useHistory();

  if (error) {
    return <ApolloErrorHandler error={error} />;
  } else if (loading) {
    return (
      <Frame>
        <ReactLoader loaded={false} />
      </Frame>
    );
  } else if (!data) {
    throw new EvalError();
  }

  const randomNodeId = data.kgById.randomNode.id;

  history.push(Hrefs.kg({id: kgId}).node({id: randomNodeId}));
  return <React.Fragment />;
};
