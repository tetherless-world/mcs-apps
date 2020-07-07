import {KgNodeSearchResultsPage} from "../../support/kg/pages/KgNodeSearchResultsPage";
import {KgNode} from "../../support/kg/models/KgNode";
import {TestData} from "../../support/kg/KgTestData";
import {KgNodePage} from "../../support/kg/pages/KgNodePage";

context("KgNodeSearchResultsPage", () => {
  let page: KgNodeSearchResultsPage;
  let node: KgNode;
  let totalNodes: number;

  before(() => {
    TestData.kgNodes.then((kgNodes) => {
      node = kgNodes[0];
      page = new KgNodeSearchResultsPage(node.label);
      totalNodes = kgNodes.length;
    });
  });

  beforeEach(() => page.visit());

  it("Should show title", () => {
    // MUIDataTable appears to be creating two
    // title elements, only one is visible, and I have
    // no idea why
    page.resultsTable.title.should(
      "have.text",
      `${totalNodes} results for "${node.label}"${totalNodes} results for "${node.label}"`
    );
  });

  it("Should show node page", () => {
    page.resultsTable.row(0).nodeLink.click();

    const nodePage = new KgNodePage(node.id);

    nodePage.assertLoaded();
  });

  it("Should show datasource search", () => {
    page.resultsTable.row(0).datasourceLink.click();

    page.resultsTable.title.should(
      "have.text",
      `${totalNodes} results in ${node.datasource}${totalNodes} results in ${node.datasource}`
    );
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
});
