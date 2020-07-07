import * as React from "react";

import {Typography} from "@material-ui/core";

export const NotFound: React.FunctionComponent<{label: string}> = ({label}) => {
  return <Typography variant="h5">{label} was not found</Typography>;
};
