import {TestData} from "../support/TestData";
import {BenchmarkPage} from "../support/page_files/BenchmarkPage";
import {Benchmark} from "../support/Benchmark";
import {BenchmarkDataset} from "../support/BenchmarkDataset";
import {BenchmarkDatasetPage} from "../support/page_files/BenchmarkDatasetPage";

context("Benchmark dataset page", () => {
  let benchmark: Benchmark;
  let dataset: BenchmarkDataset;
  let page: BenchmarkDatasetPage;

  before(() => {
    TestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
      dataset = benchmark.datasets.find((dataset) =>
        dataset.id.endsWith("-test")
      )!;
      page = new BenchmarkDatasetPage(benchmark.id, dataset.id);
      page.visit();
    });
  });

  it("should show the dataset name", () => {
    page.datasetName.should("have.text", dataset.name);
  });

  it("should show submissions", () => {
    TestData.benchmarkSubmissions.then((submissions) => {
      submissions
        .filter(
          (submission) =>
            submission.benchmarkId == benchmark.id &&
            submission.datasetId == dataset.id
        )
        .forEach((submission) => {
          page.submissionsTable
            .submission(submission.id)
            .name.should("have.text", submission.name);
        });
    });
  });
});
