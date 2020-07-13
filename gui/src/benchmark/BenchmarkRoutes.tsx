import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import {KgNodeSearchResultsPage} from "kg/components/kg/search/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "kg/components/kg/node/KgNodePage";
import {BenchmarkNoRoute} from "benchmark/components/error/BenchmarkNoRoute";
import {BenchmarkHrefs} from "benchmark/BenchmarkHrefs";
import {kgId} from "shared/api/kgId";
import {BenchmarksPage} from "benchmark/components/benchmark/BenchmarksPage";
import {BenchmarkPage} from "benchmark/components/benchmark/BenchmarkPage";
import {BenchmarkDatasetPage} from "benchmark/components/benchmark/BenchmarkDatasetPage";
import {BenchmarkAnswerPage} from "benchmark/components/benchmark/BenchmarkAnswerPage";
import {BenchmarkSubmissionPage} from "benchmark/components/benchmark/BenchmarkSubmissionPage";

const questionIdParam = {id: ":questionId", idEncoded: true};
const benchmarkIdParam = {id: ":benchmarkId", idEncoded: true};
const datasetIdParam = {id: ":datasetId", idEncoded: true};
const submissionIdParam = {id: ":submissionId", idEncoded: true};

export const BenchmarkRoutes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path={BenchmarkHrefs.home}>
        <Redirect to={BenchmarkHrefs.benchmarks} />
      </Route>

      {/* Benchmark routes */}
      <Route
        exact
        path={BenchmarkHrefs.benchmarks}
        component={BenchmarksPage}
      />
      <Route
        exact
        path={BenchmarkHrefs.benchmark(benchmarkIdParam).home}
        component={BenchmarkPage}
      />
      <Route
        exact
        path={
          BenchmarkHrefs.benchmark(benchmarkIdParam).dataset(datasetIdParam)
            .home
        }
        not
        rea
        component={BenchmarkDatasetPage}
      />
      <Route
        exact
        path={
          BenchmarkHrefs.benchmark(benchmarkIdParam)
            .dataset(datasetIdParam)
            .submission(submissionIdParam).home
        }
        component={BenchmarkSubmissionPage}
      />
      <Route
        exact
        path={BenchmarkHrefs.benchmark({
          id: ":benchmarkId",
          idEncoded: true,
        })
          .dataset(datasetIdParam)
          .submission(submissionIdParam)
          .question(questionIdParam)}
        component={BenchmarkAnswerPage}
      />

      {/* KG Routes */}
      <Route
        exact
        path={BenchmarkHrefs.kg({id: kgId}).nodeSearch()}
        component={KgNodeSearchResultsPage}
      />
      <Route
        path={BenchmarkHrefs.kg({id: kgId}).node({
          id: ":nodeId",
          idEncoded: true,
        })}
        component={KgNodePage}
      />

      <Route component={BenchmarkNoRoute} />
    </Switch>
  </BrowserRouter>
);
