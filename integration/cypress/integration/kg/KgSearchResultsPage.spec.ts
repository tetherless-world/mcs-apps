import {KgSearchResultsPage} from "../../support/kg/pages/KgSearchResultsPage";
import {KgNode} from "../../support/kg/models/KgNode";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgNodeLabelPage} from "../../support/kg/pages/KgNodeLabelPage";

context("KgSearchResultsPage", () => {
  let page: KgSearchResultsPage;
  let node: KgNode;
  let nodeLabel: string;
  let nodes: KgNode[];
  let source: {id: string; label: string};
  let totalSearchResults: number;
  let topNodesByLabelDescending: KgNode[];

  before(() => {
    KgTestData.kgNodes.then((kgNodes) => {
      KgTestData.kgNodeLabelCounts.then((kgNodeLabelCounts) => {
        node = kgNodes[0];
        nodeLabel = node.labels[0];
        nodes = kgNodes;
        page = new KgSearchResultsPage(nodeLabel);
        source = KgTestData.kgSources[0];
        assert(source.id === node.sourceIds[0]);
        const nodeLabelsCount = Object.keys(kgNodeLabelCounts).length;
        totalSearchResults =
          kgNodes.length + nodeLabelsCount + KgTestData.kgSources.length;
        topNodesByLabelDescending = kgNodes
          .sort((left, right) =>
            right.labels
              .slice()
              .sort()
              .join(" ")
              .localeCompare(left.labels.slice().sort().join(" "))
          )
          .slice(0, 20);
      });
    });
  });

  beforeEach(() => page.visit());

  it("should show a node label page as the first result", () => {
    page.resultsTable.row(0).nodeLabelLink.click();

    new KgNodeLabelPage(nodeLabel).assertLoaded();
  });

  it("should show source search", () => {
    page.resultsTable.row(0).sourceLink(0).click();
    page.resultsTable.title.count.should(
      "contain",
      (totalSearchResults - (KgTestData.kgSources.length - 1)).toString()
    );
    page.resultsTable.title.filters.should("contain", source.label);
  });

  it("should show rows per page", () => {
    page.resultsTable.rowsPerPage.should("have.text", 10);
  });

  it("should show count and query in the title", () => {
    page.resultsTable.title.count.should(
      "contain",
      totalSearchResults.toString()
    );
    page.resultsTable.title.queryText.should("contain", node.labels[0]);
  });

  it("should exclude some results by faceted search", () => {
    page.resultsTable.title.count.should(
      "contain",
      totalSearchResults.toString()
    );
    page.facets.sources.disclose();
    page.facets.sources.valueCheckbox("portal_test_data_secondary_0").click();
    page.resultsTable.title.count.should(
      "not.contain",
      totalSearchResults.toString()
    );
    page.resultsTable.title.filters.should(
      "contain",
      "Portal test data secondary 0"
    );
  });

  it("should sort by label descending", () => {
    page.resultsTable.header.column("Label").click();
    page.resultsTable.header.column("Label").click();

    page.resultsTable
      .row(0)
      .nodeLink.get()
      .should("have.text", topNodesByLabelDescending[0].labels[0]);

    page.resultsTable
      .get()
      .find("[data-cy=node-link]")
      .should(($els) => {
        expect($els.toArray().map(($el) => $el.innerText)).to.deep.equal(
          topNodesByLabelDescending.slice(0, 10).map((node) => node.labels[0])
        );
      });
  });

  it("should paginate on sorted nodes", () => {
    page.resultsTable.header.column("Label").click();
    page.resultsTable.header.column("Label").click();

    page.resultsTable
      .row(0)
      .nodeLink.get()
      .should("have.text", topNodesByLabelDescending[0].labels[0]);

    page.resultsTable.paginateNext();

    page.resultsTable
      .row(0)
      .nodeLink.get()
      .should("have.text", topNodesByLabelDescending[10].labels[0]);

    page.resultsTable
      .get()
      .find("[data-cy=node-link]")
      .should(($els) => {
        expect($els.toArray().map(($el) => $el.innerText)).to.deep.equal(
          topNodesByLabelDescending.slice(10, 20).map((node) => node.labels[0])
        );
      });
  });
});
