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
    {id: "P0", label: "Test data 0"},
    {id: "P1", label: "Test data 1"},
    {id: "P2", label: "Test data 2"},
    {id: "P3", label: "Test data 3"},
  ];
}
