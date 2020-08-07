import {KgNodeSearchResultsPage} from "../../support/kg/pages/KgNodeSearchResultsPage";
import {KgNode} from "../../support/kg/models/KgNode";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgNodePage} from "../../support/kg/pages/KgNodePage";

context("KgNodeSearchResultsPage", () => {
  let page: KgNodeSearchResultsPage;
  let node: KgNode;
  let source: {id: string; label: string};
  let totalNodes: number;

  before(() => {
    KgTestData.kgNodes.then((kgNodes) => {
      node = kgNodes[0];
      page = new KgNodeSearchResultsPage(node.labels[0]);
      source = KgTestData.kgSources[0];
      assert(source.id === node.sources[0]);
      totalNodes = kgNodes.length;
    });
  });

  beforeEach(() => page.visit());

  it("Should show node page", () => {
    page.resultsTable.row(0).nodeLink.click();

    const nodePage = new KgNodePage(node.id);

    nodePage.assertLoaded();
  });

  it("Should show source search", () => {
    page.resultsTable.row(0).sourceLink.click();
    page.resultsTable.title.count.should("contain", totalNodes.toString());
    page.resultsTable.title.filters.should("contain", "in " + source.label);
  });

  it("Should show rows per page", () => {
    page.resultsTable.rowsPerPage.should("have.text", 10);
  });

  it("Pagination should not break", () => {
    page.resultsTable.paginateNext();

    page.resultsTable;

    page.resultsTable.paginateBack();

    page.resultsTable;
  });

  it("should show count and query in the title", () => {
    page.resultsTable.title.count.should("contain", totalNodes.toString());
    page.resultsTable.title.queryText.should("contain", node.labels[0]);
  });
});
