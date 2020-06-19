import * as React from "react";
import {Frame} from "components/frame/Frame";
import * as BenchmarksPageQueryDocument from "api/queries/benchmark/BenchmarksPageQuery.graphql";
import {BenchmarksQuery} from "api/queries/benchmark/types/BenchmarksQuery";
import {useQuery} from "@apollo/react-hooks";
import {Grid, Typography, ListItem, List} from "@material-ui/core";
import {Link} from "react-router-dom";
import {Hrefs} from "Hrefs";
import {BenchmarkBreadcrumbs} from "components/benchmark/BenchmarkBreadcrumbs";

export const BenchmarksPage: React.FunctionComponent = () => {
  const query = useQuery<BenchmarksQuery>(BenchmarksPageQueryDocument);

  return (
    <Frame {...query}>
      {({data}) => (
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <BenchmarkBreadcrumbs />
          </Grid>
          <Grid item>
            <Typography variant="h4">Benchmarks</Typography>
          </Grid>
          <Grid item>
            <List>
              {data.benchmarks.map((bm) => (
                <ListItem key={bm.id}>
                  <Link
                    to={Hrefs.benchmark({id: bm.id}).home}
                    data-cy={`benchmark-${bm.id}`}
                  >
                    {bm.name}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      )}
    </Frame>
  );
};
