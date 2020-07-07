import * as React from "react";
import {Frame} from "kg/components/frame/Frame";
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
import {BenchmarkFrame} from "components/benchmark/BenchmarkFrame";
import {BenchmarkLink} from "components/benchmark/BenchmarkLink";

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
                    {data.benchmarks.map((benchmark) => (
                      <ListItem key={benchmark.id}>
                        <BenchmarkLink
                          benchmark={benchmark}
                          style={{fontSize: "larger"}}
                        />
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
