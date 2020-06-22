import {KgNode} from "./models/kg/KgNode";
import {KgEdge} from "./models/kg/KgEdge";
import {Benchmark} from "./models/benchmark/Benchmark";
import {BenchmarkSubmission} from "./models/benchmark/BenchmarkSubmission";
import {BenchmarkAnswer} from "./models/benchmark/BenchmarkAnswer";
import {BenchmarkQuestion} from "./models/benchmark/BenchmarkQuestion";

export class TestData {
  static readonly kgId = "cskg";

  static readonly datasources = ["portal_test_data"];

  static get benchmarks(): Cypress.Chainable<Benchmark[]> {
    return cy.fixture("benchmark/benchmarks.json");
  }

  static get benchmarkQuestions(): Cypress.Chainable<BenchmarkQuestion[]> {
    return cy.fixture("benchmark/benchmark_questions.json");
  }

  static get benchmarkSubmissions(): Cypress.Chainable<BenchmarkSubmission[]> {
    return cy.fixture("benchmark/benchmark_submissions.json");
  }

  static get benchmarkAnswers(): Cypress.Chainable<BenchmarkAnswer[]> {
    return cy.fixture("benchmark/benchmark_answers.json");
  }

  static get kgNodes(): Cypress.Chainable<KgNode[]> {
    return cy.fixture("kg/nodes.json");
  }

  static get kgEdges(): Cypress.Chainable<KgEdge[]> {
    return cy.fixture("kg/edges.json");
  }
}
