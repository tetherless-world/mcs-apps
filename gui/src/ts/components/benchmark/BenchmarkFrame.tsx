import * as React from "react";
import {BenchmarkBreadcrumbsProps} from "components/benchmark/BenchmarkBreadcrumbsProps";
import {Grid} from "@material-ui/core";
import {BenchmarkBreadcrumbs} from "components/benchmark/BenchmarkBreadcrumbs";

export const BenchmarkFrame: React.FunctionComponent<React.PropsWithChildren<
  BenchmarkBreadcrumbsProps
>> = (props) => {
  const {children, ...breadcrumbProps} = props;
  return (
    <Grid container direction="column">
      <Grid item>
        <BenchmarkBreadcrumbs {...breadcrumbProps} />
      </Grid>
      <Grid item>{children}</Grid>
    </Grid>
  );
};
