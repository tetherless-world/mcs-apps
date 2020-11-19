import {KgNode} from "../../support/kg/models/KgNode";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgNodeLabelPage} from "../../support/kg/pages/KgNodeLabelPage";
import {KgNodeLabelPageTab} from "../../support/kg/pages/KgNodeLabelPageTab";
import {KgNodePage} from "../../support/kg/pages/KgNodePage";

context("KG node label page", () => {
  let page: KgNodeLabelPage;
  let node: KgNode;
  let nodeLabel: string;
  // let testNodeEdges: KgEdge[];

  before(() => {
    KgTestData.kgNodes.then((nodes) => {
      node = nodes[0];
      // KgTestData.kgEdges.then((edges) => {
      //   testNodeEdges = edges.filter((edge) => edge.subject === node.id);
      // });
      nodeLabel = node.labels[0];
      page = new KgNodeLabelPage(nodeLabel);
    });
  });

  beforeEach(() => {
    page.visit();
  });

  it("should have the node label in its card title", () => {
    page.nodeLabelTitle.should("contain", node.labels[0]);
  });

  it("should show the node label sources", () => {
    for (const sourceId of node.sourceIds) {
      console.info("Node:", node);
      page
        .source(sourceId)
        .should(
          "contain",
          KgTestData.kgSources.find((source) => source.id === sourceId)!.label
        );
    }
  });

  it("should have the edges tab selected by default", () => {
    page.assertTabSelected(KgNodeLabelPageTab.Edges);
  });

  it("should allow selecting the node tab", () => {
    page.selectTab(KgNodeLabelPageTab.Nodes);
    page.assertTabLoaded(KgNodeLabelPageTab.Nodes);
    page.assertTabSelected(KgNodeLabelPageTab.Nodes);
  });

  it("should show the node in the node tab", () => {
    page.selectTab(KgNodeLabelPageTab.Nodes);
    page.nodesTable.row(0).id.should("have.text", node.id);
    page.nodesTable.row(0).id.click();
    new KgNodePage(node.id).assertLoaded();
  });
});
