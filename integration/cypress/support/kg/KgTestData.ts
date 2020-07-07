import { KgNode } from "./models/KgNode";
import { KgEdge } from "./models/KgEdge";

export class TestData {
  static readonly kgId = "cskg";

  static readonly datasources = ["portal_test_data"];

  static get kgNodes(): Cypress.Chainable<KgNode[]> {
    return cy.fixture("kg/nodes.json");
  }

  static get kgEdges(): Cypress.Chainable<KgEdge[]> {
    return cy.fixture("kg/edges.json");
  }
}
