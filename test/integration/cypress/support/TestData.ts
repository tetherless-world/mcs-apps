import {KgNode} from "./KgNode";
import {KgEdge} from "./KgEdge";
import {KgPath} from "./KgPath";

export class TestData {
  static readonly kgId = "cskg";

  static readonly datasources = ["portal_test_data"];

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
