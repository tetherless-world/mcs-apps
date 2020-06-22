import * as React from "react";
import {Link, useParams} from "react-router-dom";
import {BenchmarkPageQuery} from "api/queries/benchmark/types/BenchmarkPageQuery";
import * as BenchmarkPageQueryDocument from "api/queries/benchmark/BenchmarkPageQuery.graphql";
import {useQuery} from "@apollo/react-hooks";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import {Hrefs} from "Hrefs";
import {BenchmarkSubmissionsTable} from "components/benchmark/BenchmarkSubmissionsTable";
import {Frame} from "components/frame/Frame";
import {NotFound} from "components/error/NotFound";
import {BenchmarkFrame} from "./BenchmarkFrame";

export const BenchmarkPage: React.FunctionComponent = () => {
  const {benchmarkId} = useParams<{benchmarkId: string}>();

  const query = useQuery<BenchmarkPageQuery>(BenchmarkPageQueryDocument, {
    variables: {benchmarkId},
  });

  return (
    <Frame {...query}>
      {({data}) => {
        const benchmark = data.benchmarkById;
        if (!benchmark) {
          return <NotFound label={benchmarkId} />;
        }

        return (
          <BenchmarkFrame
            title={benchmark.name}
            {...{
              benchmark: {id: benchmarkId, name: benchmark.name},
            }}
          >
            <Grid container direction="column" spacing={6}>
              <Grid item>
                <Typography variant="h5">Datasets</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Submissions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {benchmark?.datasets.map((dataset) => (
                      <TableRow key={dataset.id}>
                        <TableCell data-cy={"dataset-name-" + dataset.id}>
                          <Link
                            to={
                              Hrefs.benchmark({id: benchmarkId}).dataset({
                                id: dataset.id,
                              }).home
                            }
                          >
                            {dataset.name}
                          </Link>
                        </TableCell>
                        <TableCell>{dataset.submissionsCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
              {benchmark.submissions.length > 0 ? (
                <Grid item>
                  <Typography variant="h5">Submissions</Typography>
                  <BenchmarkSubmissionsTable
                    benchmarkSubmissions={benchmark.submissions.map(
                      (submission) => ({
                        ...submission,
                        benchmarkId,
                      })
                    )}
                  />
                </Grid>
              ) : null}
            </Grid>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
