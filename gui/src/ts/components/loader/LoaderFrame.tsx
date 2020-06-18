import * as ReactLoader from "react-loader";
import * as React from "react";
import {Frame} from "components/frame/Frame";

export const LoaderFrame: React.FunctionComponent = () => (
  <Frame>
    <ReactLoader loaded={false} />
  </Frame>
);
