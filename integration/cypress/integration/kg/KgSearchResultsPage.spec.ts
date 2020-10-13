import {KgSearchResultsPage} from "../../support/kg/pages/KgSearchResultsPage";
import {KgNode} from "../../support/kg/models/KgNode";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgNodeLabelPage} from "../../support/kg/pages/KgNodeLabelPage";

context("KgSearchResultsPage", () => {
  let node: KgNode;
  let nodeLabel: string;
  let nodes: KgNode[];
  let source: {id: string; label: string};
  let totalSearchResults: number;
  let nodeLabelsDescending: string[];

  before(() => {
    KgTestData.kgNodes.then((kgNodes) => {
      KgTestData.kgNodeLabelCounts.then((kgNodeLabelCounts) => {
        node = kgNodes[0];
        nodeLabel = node.labels[0];
        nodes = kgNodes;
        source = KgTestData.kgSources[0];
        assert(source.id === node.sourceIds[0]);
        const nodeLabelsCount = Object.keys(kgNodeLabelCounts).length;
        totalSearchResults =
          kgNodes.length + nodeLabelsCount + KgTestData.kgSources.length;
        nodeLabelsDescending = Object.keys(kgNodeLabelCounts).sort(
          (left, right) => left.localeCompare(right) * -1
        );
      });
    });
  });

  it("should show a node label page as the first result", () => {
    const page = new KgSearchResultsPage(nodeLabel);
    page.visit();
    page.resultsTable.row(0).nodeLabelLink.click();
    new KgNodeLabelPage(nodeLabel).assertLoaded();
  });

  it("should show source search", () => {
    const page = new KgSearchResultsPage(nodeLabel);
    page.visit();
    page.resultsTable.row(0).sourceLink(0).click();
    page.resultsTable.title.count.should(
      "contain",
      (totalSearchResults - (KgTestData.kgSources.length - 1)).toString()
    );
    page.resultsTable.title.filters.should("contain", source.label);
  });

  it("should show rows per page", () => {
    const page = new KgSearchResultsPage(nodeLabel);
    page.visit();
    page.resultsTable.rowsPerPage.should("have.text", 10);
  });

  it("should show count and query in the title", () => {
    const page = new KgSearchResultsPage(nodeLabel);
    page.visit();
    page.resultsTable.title.count.should("contain", "501");
    page.resultsTable.title.queryText.should("contain", nodeLabel);
  });

  it("should exclude some results by excluding a source facet", () => {
    const page = new KgSearchResultsPage("");
    page.visit();
    page.resultsTable.title.count.should(
      "contain",
      totalSearchResults.toString()
    );
    page.facets.sources.disclose();
    page.facets.sources.valueCheckbox(KgTestData.kgSources[1].id).click();
    page.resultsTable.title.count.should(
      "not.contain",
      totalSearchResults.toString()
    );
    page.resultsTable.title.filters.should(
      "contain",
      KgTestData.kgSources[1].label
    );
  });

  it("should exclude some results by excluding a type facet", () => {
    const page = new KgSearchResultsPage("");
    page.visit();
    page.resultsTable.title.count.should(
      "contain",
      totalSearchResults.toString()
    );
    page.facets.types.disclose();
    page.facets.types.valueCheckbox("Node").click();
    page.resultsTable.title.count.should(
      "not.contain",
      totalSearchResults.toString()
    );
    page.resultsTable.title.filters.should("contain", "Node");
  });

  it("should sort by label descending", () => {
    const page = new KgSearchResultsPage();
    page.visit();

    page.resultsTable.header.column("Label").click();
    page.resultsTable.header.column("Label").click();

    page.resultsTable
      .row(0)
      .nodeLabelLink.should(
        "have.text",
        "Node label: " + nodeLabelsDescending[0]
      );

    page.resultsTable
      .get()
      .find("[data-cy=node-label-link]")
      .should(($els) => {
        expect($els.toArray().map(($el) => $el.innerText)).to.deep.equal(
          nodeLabelsDescending
            .slice(0, 10)
            .map((nodeLabel) => "Node label: " + nodeLabel)
        );
      });
  });

  it("should paginate on sorted nodes", () => {
    const page = new KgSearchResultsPage();
    page.visit();

    page.resultsTable.header.column("Label").click();
    page.resultsTable.header.column("Label").click();

    page.resultsTable
      .row(0)
      .nodeLabelLink.should("contain", nodeLabelsDescending[0]);

    page.resultsTable.paginateNext();

    page.resultsTable
      .row(0)
      .nodeLabelLink.should("contain", nodeLabelsDescending[10]);

    page.resultsTable
      .get()
      .find("[data-cy=node-label-link]")
      .should(($els) => {
        expect($els.toArray().map(($el) => $el.innerText)).to.deep.equal(
          nodeLabelsDescending
            .slice(10, 20)
            .map((nodeLabel) => "Node label: " + nodeLabel)
        );
      });
  });
});
