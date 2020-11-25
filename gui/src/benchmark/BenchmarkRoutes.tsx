import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {KgSearchResultsPage} from "kg/components/kg/search/KgSearchResultsPage";
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
import {BenchmarkHrefsContext} from "benchmark/BenchmarkHrefsContext";

const questionIdParam = {id: ":questionId", idEncoded: true};
const benchmarkIdParam = {id: ":benchmarkId", idEncoded: true};
const datasetIdParam = {id: ":datasetId", idEncoded: true};
const submissionIdParam = {id: ":submissionId", idEncoded: true};

export const BenchmarkRoutes: React.FunctionComponent = () => {
  const hrefs = React.useContext<BenchmarkHrefs>(BenchmarkHrefsContext);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={hrefs.base}>
          <Redirect to={hrefs.benchmarks} />
        </Route>

        {/* Benchmark routes */}
        <Route exact path={hrefs.benchmarks} component={BenchmarksPage} />
        <Route
          exact
          path={hrefs.benchmark(benchmarkIdParam).home}
          component={BenchmarkPage}
        />
        <Route
          exact
          path={hrefs.benchmark(benchmarkIdParam).dataset(datasetIdParam).home}
          not
          rea
          component={BenchmarkDatasetPage}
        />
        <Route
          exact
          path={
            hrefs
              .benchmark(benchmarkIdParam)
              .dataset(datasetIdParam)
              .submission(submissionIdParam).home
          }
          component={BenchmarkSubmissionPage}
        />
        <Route
          exact
          path={hrefs
            .benchmark({
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
          path={hrefs.kg({id: kgId}).search()}
          component={KgSearchResultsPage}
        />
        <Route
          path={hrefs.kg({id: kgId}).node({
            id: ":nodeId",
            idEncoded: true,
          })}
          component={KgNodePage}
        />

        <Route component={BenchmarkNoRoute} />
      </Switch>
    </BrowserRouter>
  );
};
