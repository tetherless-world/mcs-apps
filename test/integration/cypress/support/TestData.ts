import {Node} from "./Node";
import {Edge} from "./Edge";

export class TestData {
  static readonly kgId = "cskg";

  static readonly datasources = ["portal_test_data"];

  static get nodes(): Cypress.Chainable<Node[]> {
    return cy.fixture("kg/nodes.json");
  }

  static get edges(): Cypress.Chainable<Edge[]> {
    return cy.fixture("kg/edges.json");
  }
}
