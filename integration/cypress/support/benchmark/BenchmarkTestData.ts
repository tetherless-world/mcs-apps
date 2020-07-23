import {Benchmark} from "./models/Benchmark";
import {BenchmarkSubmission} from "./models/BenchmarkSubmission";
import {BenchmarkAnswer} from "./models/BenchmarkAnswer";
import {BenchmarkQuestion} from "./models/BenchmarkQuestion";

export class BenchmarkTestData {
  static readonly kgId = "cskg";

  static readonly datasources = ["portal_test_data"];

  static get benchmarks(): Cypress.Chainable<Benchmark[]> {
    return cy.fixture("benchmark/benchmarks.json");
  }

  static get benchmarkQuestions(): Cypress.Chainable<BenchmarkQuestion[]> {
    return cy.fixture("benchmark/benchmark_questions.json");
  }

  static benchmarkQuestionsByDataset(datasetId: string) {
    return BenchmarkTestData.benchmarkQuestions.then((questions) =>
      questions
        .filter((question) => question.datasetId === datasetId)
        .sort(
          (left, right) =>
            parseInt(left.id.split("-").pop()!) -
            parseInt(right.id.split("-").pop()!)
        )
    );
  }

  static get benchmarkSubmissions(): Cypress.Chainable<BenchmarkSubmission[]> {
    return cy.fixture("benchmark/benchmark_submissions.json");
  }

  static get benchmarkAnswers(): Cypress.Chainable<BenchmarkAnswer[]> {
    return cy.fixture("benchmark/benchmark_answers.json");
  }
}
