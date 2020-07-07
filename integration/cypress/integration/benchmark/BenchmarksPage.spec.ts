import {TestData} from "../../support/TestData";
import {BenchmarksPage} from "../../support/pages/benchmark/BenchmarksPage";
import {Benchmark} from "../../support/models/benchmark/Benchmark";
import {BenchmarkPage} from "../../support/pages/benchmark/BenchmarkPage";

context("Benchmarks page", () => {
  let benchmark: Benchmark;
  const page = new BenchmarksPage();

  before(() => {
    TestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
    });
  });

  beforeEach(() => page.visit());

  it("should show the benchmark name", () => {
    page.benchmark(benchmark.id).should("have.text", benchmark.name);
  });

  it("should link to the benchmark page", () => {
    page.benchmark(benchmark.id).click();
    const benchmarkPage = new BenchmarkPage(benchmark.id);
    benchmarkPage.assertLoaded();
  });
});
