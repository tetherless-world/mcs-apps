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

  it("should show node page", () => {
    page.resultsTable.row(0).nodeLink.click();

    const nodePage = new KgNodePage(node.id);

    nodePage.assertLoaded();
  });

  it("should show source search", () => {
    page.resultsTable.row(0).sourceLink.click();
    page.resultsTable.title.count.should("contain", totalNodes.toString());
    page.resultsTable.title.filters.should("contain", source.label);
  });

  it("should show rows per page", () => {
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

  it("should exclude some results by faceted search", () => {
    page.resultsTable.title.count.should("contain", totalNodes.toString());
    page.facets.sources.disclose();
    page.facets.sources.valueCheckbox("portal_test_data_secondary_0").click();
    page.resultsTable.title.count.should("not.contain", totalNodes.toString());
    page.resultsTable.title.filters.should(
      "contain",
      "Portal test data secondary 0"
    );
  });

  it("should sort by label ascending", async () => {
    page.resultsTable.header.column("Label").click();
    const labels: string[] = [];
    page.resultsTable
      .get()
      .find("[data-cy=node-link]")
      .each(($el) => {
        labels.push($el.text());
      })
      .then(() => {
        const actual = labels.slice();
        cy.wrap(actual).should("deep.equal", labels.sort());
      });
  });
});
