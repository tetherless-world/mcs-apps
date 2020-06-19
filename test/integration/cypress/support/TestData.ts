import {KgNode} from "./KgNode";
import {KgEdge} from "./KgEdge";
import {KgPath} from "./KgPath";
import {Benchmark} from "./Benchmark";
import {BenchmarkSubmission} from "./BenchmarkSubmission";

export class TestData {
  static readonly kgId = "cskg";

  static readonly datasources = ["portal_test_data"];

  static get benchmarks(): Cypress.Chainable<Benchmark[]> {
    return cy.fixture("benchmark/benchmarks.json");
  }

  static get benchmarkSubmissions(): Cypress.Chainable<BenchmarkSubmission[]> {
    return cy.fixture("benchmark/benchmark_submissions.json");
  }

  static get nodes(): Cypress.Chainable<KgNode[]> {
    return cy.fixture("kg/nodes.json");
  }

  static get edges(): Cypress.Chainable<KgEdge[]> {
    return cy.fixture("kg/edges.json");
  }

  static get paths(): Cypress.Chainable<KgPath[]> {
    return cy.fixture("kg/paths.json");
  }
}
