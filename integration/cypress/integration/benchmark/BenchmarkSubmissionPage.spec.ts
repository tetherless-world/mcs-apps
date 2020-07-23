import {BenchmarkTestData} from "../../support/benchmark/BenchmarkTestData";
import {Benchmark} from "../../support/benchmark/models/Benchmark";
import {BenchmarkDataset} from "../../support/benchmark/models/BenchmarkDataset";
import {BenchmarkSubmissionPage} from "../../support/benchmark/pages/BenchmarkSubmissionPage";
import {BenchmarkSubmission} from "../../support/benchmark/models/BenchmarkSubmission";

context("Benchmark submission page", () => {
  let benchmark: Benchmark;
  let dataset: BenchmarkDataset;
  let page: BenchmarkSubmissionPage;
  let submission: BenchmarkSubmission;

  before(() => {
    BenchmarkTestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];
      dataset = benchmark.datasets.find((dataset) =>
        dataset.id.endsWith("-test")
      )!;
      BenchmarkTestData.benchmarkSubmissions.then((submissions) => {
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
    BenchmarkTestData.benchmarkQuestionsByDataset(dataset.id).then(
      (questions) => {
        questions.slice(0, 10).forEach((question) => {
          question.prompts.forEach((prompt) => {
            page.questions
              .question(question.id)
              .text.should("contain", prompt.text);
          });
        });
      }
    );
  });
});
