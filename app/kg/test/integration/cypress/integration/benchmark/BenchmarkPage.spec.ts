import {TestData} from "../../support/TestData";
import {BenchmarkPage} from "../../support/pages/benchmark/BenchmarkPage";
import {Benchmark} from "../../support/models/benchmark/Benchmark";
import {BenchmarkSubmission} from "../../support/models/benchmark/BenchmarkSubmission";
import {BenchmarkQuestion} from "../../support/models/benchmark/BenchmarkQuestion";

context("Benchmark page", () => {
  let benchmark: Benchmark;
  let benchmarkQuestions: BenchmarkQuestion[];
  let benchmarkSubmissions: BenchmarkSubmission[];
  let page: BenchmarkPage;

  before(() => {
    TestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
      TestData.benchmarkQuestions.then((questions) => {
        benchmarkQuestions = questions;
        TestData.benchmarkSubmissions.then((submissions) => {
          benchmarkSubmissions = submissions;
          page = new BenchmarkPage(benchmark.id);
          page.visit();
        });
      });
    });
  });

  it("should show the benchmark name", () => {
    page.benchmarkName.should("have.text", benchmark.name);
  });

  it("should show datasets", () => {
    benchmark.datasets.forEach((dataset) => {
      const submissions = benchmarkSubmissions.filter(
        (submission) =>
          submission.benchmarkId === benchmark.id &&
          submission.datasetId === dataset.id
      );
      const questions = benchmarkQuestions.filter(
        (question) => question.datasetId === dataset.id
      );
      page.datasetsTable
        .dataset(dataset.id)
        .name.should("have.text", dataset.name);
      page.datasetsTable
        .dataset(dataset.id)
        .questionsCount.should("have.text", questions.length);
      page.datasetsTable
        .dataset(dataset.id)
        .submissionsCount.should("have.text", submissions.length);
    });
  });

  it("should show submissions", () => {
    TestData.benchmarks.then(benchmarks => {
      TestData.benchmarkSubmissions.then((submissions) => {
        submissions
          .filter((submission) => submission.benchmarkId == benchmark.id)
          .forEach((submission) => {
            const benchmark = benchmarks.find(benchmark => benchmark.id === submission.benchmarkId)!;
            const dataset = benchmark.datasets.find(dataset => dataset.id === submission.datasetId)!;
            const tableRow = page.submissions
              .submission(submission.id);
            tableRow.datasetName.should("have.text", dataset.name)
            tableRow.name.should("have.text", submission.name);
          });
      });
  });

  // it("should link back to benchmarks page", () => {
  //   page.benchmarksLink.click();
  //   const benchmarksPage = new BenchmarksPage();
  //   benchmarksPage.assertLoaded();
  // });
});
