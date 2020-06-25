import {TestData} from "../../support/TestData";
import {Benchmark} from "../../support/models/benchmark/Benchmark";
import {BenchmarkDataset} from "../../support/models/benchmark/BenchmarkDataset";
import {BenchmarkSubmissionPage} from "../../support/pages/benchmark/BenchmarkSubmissionPage";
import {BenchmarkSubmission} from "../../support/models/benchmark/BenchmarkSubmission";

context("Benchmark submission page", () => {
  let benchmark: Benchmark;
  let dataset: BenchmarkDataset;
  let page: BenchmarkSubmissionPage;
  let submission: BenchmarkSubmission;

  before(() => {
    TestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
      dataset = benchmark.datasets.find((dataset) =>
        dataset.id.endsWith("-test")
      )!;
      TestData.benchmarkSubmissions.then((submissions) => {
        submission = submissions.find(
          (submission) =>
            submission.benchmarkId == benchmark.id &&
            submission.datasetId == dataset.id
        )!;
        page = new BenchmarkSubmissionPage(
          benchmark.id,
          dataset.id,
          submission.id
        );
        page.visit();
      });
    });
  });

  it("should show the submission name", () => {
    page.submissionName.should("have.text", submission.name);
  });

  it("should show questions", () => {
    TestData.benchmarkQuestions.then((questions) => {
      questions
        .filter((question) => question.datasetId === dataset.id)
        .sort(
          (left, right) =>
            parseInt(left.id.split("-").pop()!) -
            parseInt(right.id.split("-").pop()!)
        )
        .slice(0, 10)
        .forEach((question) => {
          question.prompts.forEach((prompt) => {
            page.question(question.id).text.should("contain", prompt.text);
          });
        });
    });
  });
});
