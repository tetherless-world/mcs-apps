import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import * as ReactLoader from "react-loader";
import {Frame} from "components/frame/Frame";
import {RandomNodePageQuery} from "api/queries/types/RandomNodePageQuery";
import * as RandomNodePageQueryDocument from "api/queries/RandomNodePageQuery.graphql";
import {Hrefs} from "../../Hrefs";
import {useHistory} from "react-router-dom";
import {ApolloErrorHandler} from "../error/ApolloErrorHandler";

export const RandomNodePage: React.FunctionComponent = () => {
  const {data, error, loading} = useQuery<RandomNodePageQuery>(
    RandomNodePageQueryDocument
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

  const randomNodeId = data.kg.randomNode.id;

  history.push(Hrefs.node(randomNodeId));
  return <React.Fragment />;
};
