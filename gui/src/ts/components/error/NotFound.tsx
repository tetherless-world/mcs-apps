import * as React from "react";

import {Frame} from "components/frame/Frame";

import {Typography} from "@material-ui/core";

export const NotFound: React.FunctionComponent<{label: string}> = ({label}) => {
  return (
    <Frame>
      <Typography variant="h5">{label} was not found</Typography>
    </Frame>
  );
};
