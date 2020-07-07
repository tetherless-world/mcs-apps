import {TestData} from "../../support/benchmark/BenchmarkTestData";
import {Benchmark} from "../../support/benchmark/models/Benchmark";
import {BenchmarkDataset} from "../../support/benchmark/models/BenchmarkDataset";
import {BenchmarkDatasetPage} from "../../support/benchmark/pages/BenchmarkDatasetPage";

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

  it("should show questions", () => {
    TestData.benchmarkQuestionsByDataset(dataset.id).then((questions) => {
      questions.slice(0, 10).forEach((question) => {
        question.prompts.forEach((prompt) => {
          page.questions
            .question(question.id)
            .text.should("contain", prompt.text);
        });
      });
    });
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
          page.submissions
            .submission(submission.id)
            .name.should("have.text", submission.name);
        });
    });
  });
});
