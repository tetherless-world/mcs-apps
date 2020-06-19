import * as React from "react";
import {BenchmarkBreadcrumbsProps} from "components/benchmark/BenchmarkBreadcrumbsProps";
import {Grid, Typography} from "@material-ui/core";
import {BenchmarkBreadcrumbs} from "components/benchmark/BenchmarkBreadcrumbs";

interface Props extends BenchmarkBreadcrumbsProps {
  children: React.ReactNode;
  title?: string;
}

export const BenchmarkFrame: React.FunctionComponent<Props> = (props) => {
  const {children, title, ...breadcrumbProps} = props;
  return (
    <Grid container direction="column">
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
