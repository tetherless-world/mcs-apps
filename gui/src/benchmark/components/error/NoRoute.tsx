import * as React from "react";

import {useLocation} from "react-router-dom";

import {Frame} from "benchmark/components/frame/Frame";

export const NoRoute: React.FunctionComponent = () => {
  const location = useLocation();
  return (
    <Frame data={true} loading={false}>
      {({data}) => (
        <h3>
          <code>{location.pathname}</code>
        </h3>
      )}
    </Frame>
  );
};
