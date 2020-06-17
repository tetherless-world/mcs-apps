import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import {KgNodeSearchResultsPage} from "components/kg/search/KgNodeSearchResultsPage";
import * as React from "react";
import {KgNodePage} from "components/kg/node/KgNodePage";
import {NoRoute} from "components/error/NoRoute";
import {KgHomePage} from "components/kg/KgHomePage";
import {Hrefs} from "Hrefs";
import {RandomKgNodePage} from "components/kg/node/RandomKgNodePage";
import {KgPathPage} from "components/kg/path/KgPathPage";
import {kgId} from "api/kgId";
import {BenchmarksPage} from "components/benchmark/BenchmarksPage";
import {BenchmarkPage} from "components/benchmark/BenchmarkPage";
import {BenchmarkQuestionSetPage} from "components/benchmark/BenchmarkQuestionSetPage";
import {BenchmarkAnswerPage} from "components/benchmark/BenchmarkAnswerPage";
import {BenchmarkSubmissionPage} from "components/benchmark/BenchmarkSubmissionPage";

const answerIdParam = {id: ":answerId", idEncoded: true};
const benchmarkIdParam = {id: ":benchmarkId", idEncoded: true};
const questionSetIdParam = {id: ":questionSetId", idEncoded: true};
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
        path={
          Hrefs.benchmark(benchmarkIdParam).questionSet(questionSetIdParam).home
        }
        not
        rea
        component={BenchmarkQuestionSetPage}
      />
      <Route
        exact
        path={
          Hrefs.benchmark(benchmarkIdParam)
            .questionSet(questionSetIdParam)
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
          .questionSet(questionSetIdParam)
          .submission(submissionIdParam)
          .answer(answerIdParam)}
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
      <Route path={Hrefs.kg({id: kgId}).paths} component={KgPathPage} />
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
