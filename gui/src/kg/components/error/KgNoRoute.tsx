import * as React from "react";

import {useLocation} from "react-router-dom";

export const KgNoRoute: React.FunctionComponent = () => {
  const location = useLocation();
  return (
    <h3>
      No such page: <code>{location.pathname}</code>
    </h3>
  );
};
