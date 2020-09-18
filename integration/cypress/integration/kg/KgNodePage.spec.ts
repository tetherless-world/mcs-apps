import {KgNodePage} from "../../support/kg/pages/KgNodePage";
import {KgNode} from "../../support/kg/models/KgNode";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgEdge} from "../../support/kg/models/KgEdge";
import {KgNodePageTab} from "../../support/kg/pages/KgNodePageTab";

context("KG node page", () => {
  let page: KgNodePage;
  let node: KgNode;
  let testNodeEdges: KgEdge[];

  before(() => {
    KgTestData.kgNodes.then((nodes) => {
      node = nodes[0];
      KgTestData.kgEdges.then((edges) => {
        testNodeEdges = edges.filter((edge) => edge.subject === node.id);
      });
      page = new KgNodePage(node.id);
    });
  });

  beforeEach(() => {
    page.visit();
  });

  it("should have the node label in its card title", () => {
    page.nodeTitle.should("contain", node.labels[0]);
  });

  it("should show edge objects by predicate", () => {
    const edge = testNodeEdges[0];
    page.gridEdgeList(edge.predicate).list.should("exist");
  });

  it("should show the node source", () => {
    page.source.should("contain", "Portal test data");
  });

  it("should have the grid tab selected by default", () => {
    page.assertTabSelected(KgNodePageTab.EdgesGrid);
  });

  it("should route to the edge object list when the tab is clicked", () => {
    page.selectTab(KgNodePageTab.EdgesList);
    page.assertTabLoaded(KgNodePageTab.EdgesList);
  });

  it("should contain edge object lists in the list tab", () => {
    const edge = testNodeEdges[0];
    page.visitTab(KgNodePageTab.EdgesList);
    page.listEdgeList(edge.predicate).list.should("exist");
  });
});
