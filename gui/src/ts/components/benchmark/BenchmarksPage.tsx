import * as React from "react";
import {Frame} from "components/frame/Frame";
import * as BenchmarksPageQueryDocument from "api/queries/benchmark/BenchmarksPageQuery.graphql";
import {BenchmarksQuery} from "api/queries/benchmark/types/BenchmarksQuery";
import {useQuery} from "@apollo/react-hooks";
import {
  ListItem,
  List,
  CardContent,
  Card,
  Grid,
  CardHeader,
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {Hrefs} from "Hrefs";
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";

export const BenchmarksPage: React.FunctionComponent = () => {
  const query = useQuery<BenchmarksQuery>(BenchmarksPageQueryDocument);

  return (
    <Frame {...query}>
      {({data}) => (
        <BenchmarkFrame>
          <Grid container>
            <Grid item xs={6}>
              <Card>
                <CardHeader title="Benchmarks" />
                <CardContent>
                  <List>
                    {data.benchmarks.map((bm) => (
                      <ListItem key={bm.id}>
                        <Link
                          style={{fontSize: "larger"}}
                          to={Hrefs.benchmark({id: bm.id}).home}
                          data-cy={`benchmark-${bm.id}`}
                        >
                          {bm.name}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </BenchmarkFrame>
      )}
    </Frame>
  );
};
