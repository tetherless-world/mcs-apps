import * as React from "react";
import {Frame} from "components/frame/Frame";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import * as ReactLoader from "react-loader";
import * as _ from "lodash";
import {ApolloError} from "apollo-client";

export interface BenchmarkFrameChildrenProps<TData> {
  data: TData;
}

export interface BenchmarkFrameProps<TData> {
  children: (props: BenchmarkFrameChildrenProps<TData>) => React.ReactNode;
  data?: TData;
  error?: ApolloError;
  loading: boolean;
}

export const BenchmarkFrame = <TData,>({
  children,
  data,
  error,
  loading,
}: BenchmarkFrameProps<TData>) => {
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
  } else {
    return <Frame>{children({data})}</Frame>;
  }
};
