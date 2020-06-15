import {KgNode} from "./Node";
import {KgEdge} from "./Edge";

export class TestData {
  static readonly kgId = "cskg";

  static readonly datasources = ["portal_test_data"];

  static get nodes(): Cypress.Chainable<KgNode[]> {
    return cy.fixture("kg/nodes.json");
  }

  static get edges(): Cypress.Chainable<KgEdge[]> {
    return cy.fixture("kg/edges.json");
  }
}
