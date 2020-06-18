import * as React from "react";
import {Frame} from "components/frame/Frame";
import {Link, useParams} from "react-router-dom";
import {BenchmarkPageQuery} from "api/queries/benchmark/types/BenchmarkPageQuery";
import * as BenchmarkPageQueryDocument from "api/queries/benchmark/BenchmarkPageQuery.graphql";
import {ApolloErrorHandler} from "components/error/ApolloErrorHandler";
import {useQuery} from "@apollo/react-hooks";
import * as ReactLoader from "react-loader";
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

export const BenchmarkPage: React.FunctionComponent = () => {
  const {benchmarkId} = useParams<{benchmarkId: string}>();

  const {data, error, loading} = useQuery<BenchmarkPageQuery>(
    BenchmarkPageQueryDocument,
    {variables: {benchmarkId}}
  );

  if (error) {
    return <ApolloErrorHandler error={error} />;
  } else if (loading) {
    return (
      <Frame>
        <ReactLoader loaded={false} />
      </Frame>
    );
  } else if (!data) {
    throw new EvalError();
  }

  const benchmark = data.benchmarkById;
  if (!benchmark) {
    return (
      <Frame>
        <h3>
          <code>{benchmarkId} not found</code>
        </h3>
      </Frame>
    );
  }

  return (
    <Frame>
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Typography variant="h4">{benchmark.name}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5">Datasets</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {/*<TableCell>Type</TableCell>*/}
              </TableRow>
            </TableHead>
            <TableBody>
              {benchmark.datasets.map((dataset) => (
                <TableRow key={dataset.id}>
                  <TableCell>
                    {" "}
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
                  {/*<TableCell></TableCell>*/}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Frame>
  );
};
