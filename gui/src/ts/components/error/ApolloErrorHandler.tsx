import {ApolloError} from "apollo-boost";
import {FatalErrorModal} from "./FatalErrorModal";
import {ApolloException} from "@tetherless-world/twxplore-base";
import * as React from "react";

export const ApolloErrorHandler: React.FunctionComponent<{
  error: ApolloError;
}> = ({error}) => <FatalErrorModal exception={new ApolloException(error)} />;
