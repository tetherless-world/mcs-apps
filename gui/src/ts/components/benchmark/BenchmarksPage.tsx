import * as React from "react";
import {Frame} from "components/frame/Frame";
import * as BenchmarksPageQueryDocument from "api/queries/benchmark/BenchmarksPageQuery.graphql";
import {BenchmarksQuery} from "api/queries/benchmark/types/BenchmarksQuery";
import {useQuery} from "@apollo/react-hooks";
import {FatalErrorModal} from "components/error/FatalErrorModal";
import {ApolloException} from "@tetherless-world/twxplore-base";
import * as ReactLoader from "react-loader";
import {Grid, Typography, ListItem, List} from "@material-ui/core";
import {Link} from "react-router-dom";
import {Hrefs} from "Hrefs";

export const BenchmarksPage: React.FunctionComponent = () => {
  const {data, error, loading} = useQuery<BenchmarksQuery>(
    BenchmarksPageQueryDocument
  );

  if (error) {
    return <FatalErrorModal exception={new ApolloException(error)} />;
  } else if (loading) {
    return (
      <Frame>
        <ReactLoader loaded={false} />
      </Frame>
    );
  } else if (!data) {
    throw new EvalError();
  }

  return (
    <Frame>
      <Grid container direction="column" spacing={1}>
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
    </Frame>
  );
};
