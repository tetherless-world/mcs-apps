import * as React from "react";

import {useLocation} from "react-router-dom";

import {BenchmarkFrame} from "benchmark/components/frame/BenchmarkFrame";

export const BenchmarkNoRoute: React.FunctionComponent = () => {
  const location = useLocation();
  return (
    <BenchmarkFrame data={true} loading={false}>
      {({data}) => (
        <h3>
          <code>{location.pathname}</code>
        </h3>
      )}
    </BenchmarkFrame>
  );
};
