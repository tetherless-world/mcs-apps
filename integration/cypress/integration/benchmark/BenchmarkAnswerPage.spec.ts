import {BenchmarkAnswerPage} from "../../support/benchmark/pages/BenchmarkAnswerPage";
import {BenchmarkTestData} from "../../support/benchmark/BenchmarkTestData";
import {Benchmark} from "../../support/benchmark/models/Benchmark";
import {BenchmarkDataset} from "../../support/benchmark/models/BenchmarkDataset";
import {BenchmarkSubmission} from "../../support/benchmark/models/BenchmarkSubmission";
import {
  BenchmarkQuestion,
  BenchmarkQuestionPromptType,
} from "../../support/benchmark/models/BenchmarkQuestion";
import {BenchmarkAnswer} from "../../support/benchmark/models/BenchmarkAnswer";
import {BenchmarkPage} from "../../support/benchmark/pages/BenchmarkPage";
import {BenchmarkDatasetPage} from "../../support/benchmark/pages/BenchmarkDatasetPage";
import {BenchmarkSubmissionPage} from "../../support/benchmark/pages/BenchmarkSubmissionPage";

context("BenchmarkAnswerPage", () => {
  let benchmark: Benchmark;
  let dataset: BenchmarkDataset;
  let submission: BenchmarkSubmission;
  let question: BenchmarkQuestion;
  let answer: BenchmarkAnswer;

  let page: BenchmarkAnswerPage;

  before(() => {
    BenchmarkTestData.benchmarks.then((benchmarks) => {
      benchmark = benchmarks[0];

      dataset = benchmark.datasets.find((dataset) =>
        dataset.id.endsWith("-test")
      )!;

      BenchmarkTestData.benchmarkSubmissions.then((submissions) => {
        submission = submissions.find(
          (submission) =>
            submission.benchmarkId === benchmark.id &&
            submission.datasetId === dataset.id
        )!;

        BenchmarkTestData.benchmarkQuestions.then((questions) => {
          question = questions.find(
            (question) =>
              question.datasetId === dataset.id && question.id.search("test")
          )!;

          BenchmarkTestData.benchmarkAnswers.then((answers) => {
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
          });
        });
      });
    });
  });

  beforeEach(() => page.visit());

  it("should show question text", () => {
    const promptTypeIndices: {
      [key in BenchmarkQuestionPromptType]: number;
    } = {
      [BenchmarkQuestionPromptType.Goal]: 0,
      [BenchmarkQuestionPromptType.Observation]: 0,
      [BenchmarkQuestionPromptType.Question]: 0,
    };
    question.prompts.forEach((prompt) => {
      page
        .question(prompt.type, promptTypeIndices[prompt.type])
        .text.should("contain", prompt.text);
      promptTypeIndices[prompt.type]++;
    });
  });

  it("should show question answer choices", () => {
    question.choices.forEach((choice) => {
      page.answer(choice.id).text.should("have.text", choice.text);
    });
  });

  it("should show appropriate question answer icons", () => {
    if (answer.choiceId === question.correctChoiceId) {
      page.answer(answer.choiceId).assertCorrectSubmissionAnswer();
    } else {
      page.answer(answer.choiceId).assertSubmissionChoice();
      page.answer(question.correctChoiceId).assertCorrectChoice();
    }
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
