import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import {KgNodeSearchResultsPage} from "kg/components/kg/search/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "kg/components/kg/node/KgNodePage";
import {NoRoute} from "benchmark/components/error/NoRoute";
import {Hrefs} from "benchmark/Hrefs";
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

export const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path={Hrefs.home}>
        <Redirect to={Hrefs.benchmarks} />
      </Route>

      {/* Benchmark routes */}
      <Route exact path={Hrefs.benchmarks} component={BenchmarksPage} />
      <Route
        exact
        path={Hrefs.benchmark(benchmarkIdParam).home}
        component={BenchmarkPage}
      />
      <Route
        exact
        path={Hrefs.benchmark(benchmarkIdParam).dataset(datasetIdParam).home}
        not
        rea
        component={BenchmarkDatasetPage}
      />
      <Route
        exact
        path={
          Hrefs.benchmark(benchmarkIdParam)
            .dataset(datasetIdParam)
            .submission(submissionIdParam).home
        }
        component={BenchmarkSubmissionPage}
      />
      <Route
        exact
        path={Hrefs.benchmark({
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
        path={Hrefs.kg({id: kgId}).nodeSearch()}
        component={KgNodeSearchResultsPage}
      />
      <Route
        path={Hrefs.kg({id: kgId}).node({id: ":nodeId", idEncoded: true})}
        component={KgNodePage}
      />

      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
