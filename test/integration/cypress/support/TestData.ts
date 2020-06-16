import {KgNode} from "./Node";
import {KgEdge} from "./Edge";
import {KgPath} from "./Path";

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
