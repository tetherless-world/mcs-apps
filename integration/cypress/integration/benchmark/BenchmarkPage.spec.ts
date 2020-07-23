import {BenchmarkTestData} from "../../support/benchmark/BenchmarkTestData";
import {BenchmarkPage} from "../../support/benchmark/pages/BenchmarkPage";
import {Benchmark} from "../../support/benchmark/models/Benchmark";
import {BenchmarkSubmission} from "../../support/benchmark/models/BenchmarkSubmission";
import {BenchmarkQuestion} from "../../support/benchmark/models/BenchmarkQuestion";

context("Benchmark page", () => {
  let benchmark: Benchmark;
  let benchmarkQuestions: BenchmarkQuestion[];
  let benchmarkSubmissions: BenchmarkSubmission[];
  let page: BenchmarkPage;

  before(() => {
    BenchmarkTestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
      BenchmarkTestData.benchmarkQuestions.then((questions) => {
        benchmarkQuestions = questions;
        BenchmarkTestData.benchmarkSubmissions.then((submissions) => {
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
    BenchmarkTestData.benchmarks.then(benchmarks => {
      BenchmarkTestData.benchmarkSubmissions.then((submissions) => {
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
