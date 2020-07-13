import * as React from "react";
import {BenchmarkBreadcrumbsProps} from "benchmark/components/frame/BenchmarkBreadcrumbsProps";
import {Grid, Typography} from "@material-ui/core";
import {BenchmarkBreadcrumbs} from "benchmark/components/frame/BenchmarkBreadcrumbs";

interface Props extends BenchmarkBreadcrumbsProps {
  children: React.ReactNode;
  title?: string;
}

export const BenchmarkBreadcrumbsFrame: React.FunctionComponent<Props> = (
  props
) => {
  const {children, title, ...breadcrumbProps} = props;
  return (
    <Grid container direction="column" spacing={6}>
      <Grid item>
        <BenchmarkBreadcrumbs {...breadcrumbProps} />
      </Grid>
      {title ? (
        <Grid item>
          <Typography data-cy="benchmark-frame-title" variant="h4">
            {title}
          </Typography>
        </Grid>
      ) : null}
      <Grid item>{children}</Grid>
    </Grid>
  );
};
