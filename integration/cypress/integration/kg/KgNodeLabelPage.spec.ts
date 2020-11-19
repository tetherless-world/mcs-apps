import {KgNode} from "../../support/kg/models/KgNode";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgNodeLabelPage} from "../../support/kg/pages/KgNodeLabelPage";
import {KgNodeLabelPageTab} from "../../support/kg/pages/KgNodeLabelPageTab";

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
  //
  // it("should show edge objects by predicate", () => {
  //   const edge = testNodeEdges[0];
  //   page.gridEdgeList(edge.predicate).list.should("exist");
  // });

  it("should show the node label sources", () => {
    for (const source of KgTestData.kgSources) {
      page.source(source.id).should("contain", source.label);
    }
  });

  it("should have the edges tab selected by default", () => {
    page.assertTabSelected(KgNodeLabelPageTab.Edges);
  });
});
