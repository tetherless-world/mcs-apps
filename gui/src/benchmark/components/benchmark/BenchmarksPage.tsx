import * as React from "react";
import {BenchmarkFrame} from "benchmark/components/frame/BenchmarkFrame";
import * as BenchmarksPageQueryDocument from "benchmark/api/queries/BenchmarksPageQuery.graphql";
import {BenchmarksQuery} from "benchmark/api/queries/types/BenchmarksQuery";
import {useQuery} from "@apollo/react-hooks";
import {
  ListItem,
  List,
  CardContent,
  Card,
  Grid,
  CardHeader,
} from "@material-ui/core";
import {BenchmarkBreadcrumbsFrame} from "benchmark/components/frame/BenchmarkBreadcrumbsFrame";
import {BenchmarkLink} from "benchmark/components/benchmark/BenchmarkLink";

export const BenchmarksPage: React.FunctionComponent = () => {
  const query = useQuery<BenchmarksQuery>(BenchmarksPageQueryDocument);

  return (
    <BenchmarkFrame {...query}>
      {({data}) => (
        <BenchmarkBreadcrumbsFrame>
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
        </BenchmarkBreadcrumbsFrame>
      )}
    </BenchmarkFrame>
  );
};
