import * as React from "react";
import {Frame} from "components/frame/Frame";
import {useParams} from "react-router-dom";
import * as BenchmarkAnswerPageQueryDocument from "api/queries/benchmark/BenchmarkAnswerPageQuery.graphql";
import {
  BenchmarkAnswerPageQuery,
  BenchmarkAnswerPageQueryVariables,
} from "api/queries/benchmark/types/BenchmarkAnswerPageQuery";
import {useQuery} from "@apollo/react-hooks";
import * as _ from "lodash";
import * as ReactLoader from "react-loader";
import {ApolloException} from "@tetherless-world/twxplore-base";
import {FatalErrorModal} from "components/error/FatalErrorModal";

// benchmark/benchmark0/dataset/dev/submission/benchmark0-submission/question/benchmark0-dev
// http://localhost:9001/benchmark/benchmark0/dataset/dev/submission/benchmark0-submission/question/benchmark0-dev

interface PathParams {
  benchmarkId: string;
  datasetId: string;
  submissionId: string;
  questionId: string;
}

export const BenchmarkAnswerPage: React.FunctionComponent = () => {
  const variables = _.mapValues(useParams<PathParams>(), decodeURIComponent);
  // const {benchmarkId, datasetId, submissionId, questionId} = variables;
  const {data, error} = useQuery<
    BenchmarkAnswerPageQuery,
    BenchmarkAnswerPageQueryVariables
  >(BenchmarkAnswerPageQueryDocument, {variables});

  if (error) {
    return <FatalErrorModal exception={new ApolloException(error)} />;
  } else if (!data) {
    return (
      <Frame>
        <ReactLoader loaded={false} />
      </Frame>
    );
  } else if (!data) {
    throw new EvalError();
  }

  console.log(JSON.stringify(data));

  return <Frame>laksdjf</Frame>;
};
