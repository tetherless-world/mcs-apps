import {KgHomePage} from "../../support/kg/pages/KgHomePage";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgNode} from "../../support/kg/models/KgNode";
import {KgSearchResultsPage} from "../../support/kg/pages/KgSearchResultsPage";
import {KgNodeLabelPage} from "../../support/kg/pages/KgNodeLabelPage";

context("KG Home Page", () => {
  const page = new KgHomePage();
  let node: KgNode;

  before(() => {
    KgTestData.kgNodes.then((nodes) => {
      node = nodes[0];
    });
  });

  beforeEach(() => page.visit());

  it("should show all sources", () => {
    page.search.selectedDatasource.should("have.text", "All sources");
  });

  it("should show selected source", () => {
    page.search.selectSource(KgTestData.kgSources[0].label);

    page.search.selectedDatasource.should(
      "have.text",
      KgTestData.kgSources[0].label
    );
  });

  it("should be the home page", () => {
    cy.visit("/");
    page.assertLoaded();
  });

  it("should show node label page after searching and selecting an autocompletion", () => {
    const nodeLabel = node.labels[0]; // "Shared node label 58";
    page.search.get().type(nodeLabel);

    page.search.suggestion(0).get().click();

    new KgNodeLabelPage(nodeLabel).assertLoaded();
  });

  it("should show node label page after searching for text that matches a node label exactly", () => {
    page.search.get().type(node.labels[0]);

    page.search.enter();

    new KgNodeLabelPage(node.labels[0]).assertLoaded();
  });

  it("should show node search results page after searching for text that doesn't match a node label exactly", () => {
    page.search.get().type("Shared node");

    page.search.enter();

    new KgSearchResultsPage("Shared node").assertLoaded();
  });
});
