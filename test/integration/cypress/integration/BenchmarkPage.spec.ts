import {TestData} from "../support/TestData";
import {BenchmarkPage} from "../support/page_files/BenchmarkPage";
import {Benchmark} from "../support/Benchmark";

context("Benchmark page", () => {
  let benchmark: Benchmark;
  let page: BenchmarkPage;

  before(() => {
    TestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
      page = new BenchmarkPage(benchmark.id);
      page.visit();
    });
  });

  it("should show the benchmark name", () => {
    page.benchmarkName.should("have.text", benchmark.name);
  });

  it("should show the dataset names", () => {
    benchmark.datasets.forEach((dataset) => {
      page.datasetName(dataset.id).should("have.text", dataset.name);
    });
  });
});
