import {BenchmarkAnswerPage} from "../../support/pages/benchmark/BenchmarkAnswerPage";
import {TestData} from "../../support/TestData";
import {Benchmark} from "../../support/models/benchmark/Benchmark";
import {BenchmarkDataset} from "../../support/models/benchmark/BenchmarkDataset";
import {BenchmarkSubmission} from "../../support/models/benchmark/BenchmarkSubmission";
import {BenchmarkQuestion} from "../../support/models/benchmark/BenchmarkQuestion";
import {BenchmarkAnswer} from "../../support/models/benchmark/BenchmarkAnswer";
import {BenchmarkPage} from "../../support/pages/benchmark/BenchmarkPage";
import {BenchmarkDatasetPage} from "../../support/pages/benchmark/BenchmarkDatasetPage";
import {BenchmarkSubmissionPage} from "../../support/pages/benchmark/BenchmarkSubmissionPage";

context("BenchmarkAnswerPage", () => {
  let benchmark: Benchmark;
  let dataset: BenchmarkDataset;
  let submission: BenchmarkSubmission;
  let question: BenchmarkQuestion;
  let answer: BenchmarkAnswer;

  let page: BenchmarkAnswerPage;

  before(() => {
    TestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];

      dataset = benchmark.datasets.find((dataset) =>
        dataset.id.endsWith("-test")
      )!;

      TestData.benchmarkSubmissions.then((submissions) => {
        submission = submissions.find(
          (submission) =>
            submission.benchmarkId === benchmark.id &&
            submission.datasetId === dataset.id
        )!;

        TestData.benchmarkQuestions.then((questions) => {
          question = questions.find(
            (question) =>
              question.datasetId === dataset.id && question.id.search("test")
          )!;

          TestData.benchmarkAnswers.then((answers) => {
            answer = answers.find(
              (answer) =>
                answer.submissionId === submission.id &&
                answer.questionId === question.id
            )!;

            page = new BenchmarkAnswerPage(
              benchmark.id,
              dataset.id,
              submission.id,
              question.id
            );
            page.visit();
          });
        });
      });
    });
  });

  it("should show question text", () => {
    page.question.text.should("have.text", question.text);
  });

  it("should show question answer choices", () => {
    question.choices.forEach((choice) => {
      page.question.answer(choice.label).text.should("have.text", choice.text);
    });
  });

  it("should show submission id", () => {
    page.submission.id.should("have.text", submission.id);
  });

  it("should show submission's answer ", () => {
    const answerQuestionChoice = question.choices.find(
      (choice) => choice.label === answer.choiceLabel
    );
    cy.wrap(answerQuestionChoice).should("not.be.undefined");
    page.submission.answer.label.should(
      "have.text",
      answerQuestionChoice!.label
    );
    page.submission.answer.text.should("have.text", answerQuestionChoice!.text);
  });

  it("should go to benchmark page", () => {
    page.breadcrumbs.toBenchmark();

    const benchmarkPage = new BenchmarkPage(benchmark.id);
    benchmarkPage.assertLoaded();
  });

  it("should go to dataset page", () => {
    page.breadcrumbs.toDataset();

    const datasetPage = new BenchmarkDatasetPage(benchmark.id, dataset.id);
    datasetPage.assertLoaded();
  });

  it("should go to submission page", () => {
    page.breadcrumbs.toSubmission();

    const submissionPage = new BenchmarkSubmissionPage(
      benchmark.id,
      dataset.id,
      submission.id
    );
    submissionPage.assertLoaded();
  });
});
