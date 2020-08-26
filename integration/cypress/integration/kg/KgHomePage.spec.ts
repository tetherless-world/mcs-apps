import {KgHomePage} from "../../support/kg/pages/KgHomePage";
import {KgTestData} from "../../support/kg/KgTestData";
import {KgNodePage} from "../../support/kg/pages/KgNodePage";
import {KgNode} from "../../support/kg/models/KgNode";
import {KgSearchResultsPage} from "../../support/kg/pages/KgSearchResultsPage";

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

  it("should show node page", () => {
    page.search.get().type(node.labels[0]);

    page.search.suggestion(0).get().click();

    const nodePage = new KgNodePage(node.id);

    nodePage.assertLoaded();
  });

  it("should show node search results page", () => {
    page.search.get().type(node.labels[0]);

    page.search.enter();

    const nodeSearchResultsPage = new KgSearchResultsPage(node.labels[0]);

    nodeSearchResultsPage.assertLoaded();
  });
});
