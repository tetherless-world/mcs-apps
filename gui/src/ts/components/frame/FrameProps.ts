import * as React from "react";
import {ApolloError} from "apollo-client";

interface FrameChildrenProps<TData> {
  data: TData;
}

export interface FrameProps<TData> {
  children: (props: FrameChildrenProps<TData>) => React.ReactNode;
  data?: TData;
  error?: ApolloError;
  loading: boolean;
}
