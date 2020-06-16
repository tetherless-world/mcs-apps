import {KgNodePage, KgNodePageTab} from "../support/page_files/KgNodePage";
import {KgNode} from "../support/KgNode";
import {TestData} from "../support/TestData";
import {KgEdge} from "../support/KgEdge";

context("KG node page", () => {
  let page: KgNodePage;
  let node: KgNode;
  let testNodeEdges: KgEdge[];

  before(() => {
    TestData.nodes.then((nodes) => {
      node = nodes[0];
      TestData.edges.then((edges) => {
        testNodeEdges = edges.filter((edge) => edge.subject === node.id);
      });
      page = new KgNodePage(node.id);
    });
  });

  beforeEach(() => {
    page.visit();
  });

  it("should have the node label in its card title", () => {
    page.nodeTitle.should("contain", node.label);
  });

  it("should show edges by predicate", () => {
    const edge = testNodeEdges[0];
    page.gridEdgeList(edge.predicate).list.should("exist");
  });

  it("should show the node datasource", () => {
    page.datasource.should("have.text", node.datasource);
  });

  it("should have the grid tab selected by default", () => {
    page.assertTabSelected(KgNodePageTab.PredicateGrid);
  });

  it("should route to the predicate list when the tab is clicked", () => {
    page.selectTab(KgNodePageTab.PredicateList);
    page.assertListLoaded();
  });

  it("should contain predicate lists in the list tab", () => {
    const edge = testNodeEdges[0];
    page.visitList();
    page.listEdgeList(edge.predicate).list.should("exist");
  });
});
