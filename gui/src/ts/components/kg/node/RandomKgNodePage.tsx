import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import {RandomKgNodePageQuery} from "api/queries/kg/types/RandomKgNodePageQuery";
import * as RandomKgNodePageQueryDocument from "api/queries/kg/RandomKgNodePageQuery.graphql";
import {Hrefs} from "Hrefs";
import {useHistory} from "react-router-dom";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import {kgId} from "api/kgId";
import {LoaderFrame} from "components/loader/LoaderFrame";

export const RandomKgNodePage: React.FunctionComponent = () => {
  const {data, error, loading} = useQuery<RandomKgNodePageQuery>(
    RandomKgNodePageQueryDocument,
    {variables: {kgId}}
  );

  const history = useHistory();

  if (error) {
    return <ApolloErrorHandler error={error} />;
  } else if (loading) {
    return <LoaderFrame />;
  } else if (!data) {
    throw new EvalError();
  }

  const randomNodeId = data.kgById.randomNode.id;

  history.push(Hrefs.kg({id: kgId}).node({id: randomNodeId}));
  return <React.Fragment />;
};
