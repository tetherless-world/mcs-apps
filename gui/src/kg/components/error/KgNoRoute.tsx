import * as React from "react";

import {useLocation} from "react-router-dom";

import {KgFrame} from "kg/components/frame/KgFrame";

export const KgNoRoute: React.FunctionComponent = () => {
  const location = useLocation();
  return (
    <KgFrame data={true} loading={false}>
      {({data}) => (
        <h3>
          <code>{location.pathname}</code>
        </h3>
      )}
    </KgFrame>
  );
};
