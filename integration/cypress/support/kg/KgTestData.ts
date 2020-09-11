import {KgNode} from "./models/KgNode";
import {KgEdge} from "./models/KgEdge";

export class KgTestData {
  static readonly kgId = "cskg";

  static get kgNodes(): Cypress.Chainable<KgNode[]> {
    return cy.fixture("kg/nodes.json", {timeout: 60000});
  }

  static get kgNodeLabelCounts(): Cypress.Chainable<{[index: string]: number}> {
    return this.kgNodes.then((kgNodes) => {
      let nodeLabelCounts: {[index: string]: number} = {};
      for (const node of kgNodes) {
        for (const nodeLabel of node.labels) {
          const nodeLabelCount = nodeLabelCounts[nodeLabel];
          if (typeof nodeLabelCount !== "undefined") {
            nodeLabelCounts[nodeLabel] = nodeLabelCount + 1;
          } else {
            nodeLabelCounts[nodeLabel] = 1;
          }
        }
      }
      return nodeLabelCounts;
    });
  }

  static get kgEdges(): Cypress.Chainable<KgEdge[]> {
    return cy.fixture("kg/edges.json", {timeout: 60000});
  }

  static readonly kgSources = [
    {id: "portal_test_data", label: "Portal test data"},
    {id: "portal_test_data_secondary_0", label: "Portal test data secondary 0"},
    {id: "portal_test_data_secondary_1", label: "Portal test data secondary 1"},
    {id: "portal_test_data_secondary_2", label: "Portal test data secondary 2"},
  ];
}
