import {TestData} from "../../support/TestData";
import {BenchmarkPage} from "../../support/pages/benchmark/BenchmarkPage";
import {Benchmark} from "../../support/models/benchmark/Benchmark";
import {BenchmarkSubmission} from "../../support/models/benchmark/BenchmarkSubmission";

context("Benchmark page", () => {
  let benchmark: Benchmark;
  let benchmarkSubmissions: BenchmarkSubmission[];
  let page: BenchmarkPage;

  before(() => {
    TestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
      TestData.benchmarkSubmissions.then((submissions) => {
        benchmarkSubmissions = submissions;
        page = new BenchmarkPage(benchmark.id);
        page.visit();
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
      page.datasetsTable
        .dataset(dataset.id)
        .name.should("have.text", dataset.name);
      page.datasetsTable
        .dataset(dataset.id)
        .submissionsCount.should("have.text", submissions.length);
    });
  });

  it("should show submissions", () => {
    TestData.benchmarkSubmissions.then((submissions) => {
      submissions
        .filter((submission) => submission.benchmarkId == benchmark.id)
        .forEach((submission) => {
          page.submissionsTable
            .submission(submission.id)
            .name.should("have.text", submission.name);
        });
    });
  });

  // it("should link back to benchmarks page", () => {
  //   page.benchmarksLink.click();
  //   const benchmarksPage = new BenchmarksPage();
  //   benchmarksPage.assertLoaded();
  // });
});
