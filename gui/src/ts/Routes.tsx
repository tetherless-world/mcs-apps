import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import {KgNodeSearchResultsPage} from "components/kg/search/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "components/kg/node/KgNodePage";
import {NoRoute} from "components/error/NoRoute";
import {KgHomePage} from "components/kg/KgHomePage";
import {Hrefs} from "Hrefs";
import {RandomKgNodePage} from "components/kg/node/RandomKgNodePage";
import {kgId} from "api/kgId";
import {BenchmarksPage} from "components/benchmark/BenchmarksPage";
import {BenchmarkPage} from "components/benchmark/BenchmarkPage";
import {BenchmarkDatasetPage} from "components/benchmark/BenchmarkDatasetPage";
import {BenchmarkAnswerPage} from "components/benchmark/BenchmarkAnswerPage";
import {BenchmarkSubmissionPage} from "components/benchmark/BenchmarkSubmissionPage";

const questionIdParam = {id: ":questionId", idEncoded: true};
const benchmarkIdParam = {id: ":benchmarkId", idEncoded: true};
const datasetIdParam = {id: ":datasetId", idEncoded: true};
const submissionIdParam = {id: ":submissionId", idEncoded: true};

export const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path={Hrefs.home}>
        <Redirect to={Hrefs.kgs} />
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
      <Route
        exact
        path={Hrefs.kg({id: kgId}).randomNode}
        component={RandomKgNodePage}
      />
      <Route exact path={Hrefs.kgs} component={KgHomePage} />

      <Route component={NoRoute} />
    </Switch>
  </BrowserRouter>
);
