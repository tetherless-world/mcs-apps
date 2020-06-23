import * as React from "react";
import {useParams} from "react-router-dom";
import {
  BenchmarkPageQuery,
  BenchmarkPageQuery_benchmarkById_datasets,
} from "api/queries/benchmark/types/BenchmarkPageQuery";
import * as BenchmarkPageQueryDocument from "api/queries/benchmark/BenchmarkPageQuery.graphql";
import {useQuery} from "@apollo/react-hooks";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import {BenchmarkSubmissionsTable} from "components/benchmark/BenchmarkSubmissionsTable";
import {Frame} from "components/frame/Frame";
import {NotFound} from "components/error/NotFound";
import {BenchmarkFrame} from "./BenchmarkFrame";
import {BenchmarkDatasetLink} from "components/benchmark/BenchmarkDatasetLink";

const BenchmarkDatasetsTable: React.FunctionComponent<{
  benchmarkId: string;
  datasets: BenchmarkPageQuery_benchmarkById_datasets[];
}> = ({benchmarkId, datasets}) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Questions</TableCell>
        <TableCell>Submissions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {datasets.map((dataset) => (
        <TableRow key={dataset.id} data-cy={"dataset-" + dataset.id}>
          <TableCell data-cy="dataset-name">
            <BenchmarkDatasetLink
              benchmarkDataset={dataset}
              benchmarkId={benchmarkId}
              style={{fontSize: "larger"}}
            />
          </TableCell>
          <TableCell data-cy="dataset-questions-count">
            {dataset.questionsCount}
          </TableCell>
          <TableCell data-cy="dataset-submissions-count">
            {dataset.submissionsCount}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

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
              <Grid item container>
                <Grid item xs={6}>
                  <Card>
                    <CardHeader title="Datasets" />
                    <CardContent>
                      <BenchmarkDatasetsTable
                        benchmarkId={benchmarkId}
                        datasets={benchmark.datasets}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {benchmark.submissions.length > 0 ? (
                <Grid item container>
                  <Grid item xs={6}>
                    <Card>
                      <CardHeader title="Submissions" />
                      <CardContent>
                        <BenchmarkSubmissionsTable
                          benchmarkSubmissions={benchmark.submissions.map(
                            (submission) => ({
                              ...submission,
                              benchmarkId,
                            })
                          )}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : null}
            </Grid>
          </BenchmarkFrame>
        );
      }}
    </Frame>
  );
};
