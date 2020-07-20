import {KgHomePage} from "../../support/kg/pages/KgHomePage";
import {TestData} from "../../support/kg/KgTestData";
import {KgNodePage} from "../../support/kg/pages/KgNodePage";
import {KgNode} from "../../support/kg/models/KgNode";
import {KgNodeSearchResultsPage} from "../../support/kg/pages/KgNodeSearchResultsPage";

context("KG Home Page", () => {
  const page = new KgHomePage();
  let node: KgNode;

  before(() => {
    TestData.kgNodes.then((nodes) => {
      node = nodes[0];
    });
  });

  beforeEach(() => page.visit());

  it("should show all sources", () => {
    page.search.selectedDatasource.should("have.text", "All sources");
  });

  it("should show selected source", () => {
    page.search.selectDatasource(TestData.datasources[0]);

    page.search.selectedDatasource.should("have.text", TestData.datasources[0]);
  });

  it("should be the home page", () => {
    cy.visit("/");
    page.assertLoaded();
  });

  it("should show node page", () => {
    page.search.get().type(node.label);

    page.search.suggestion(0).get().click();

    const nodePage = new KgNodePage(node.id);

    nodePage.assertLoaded();
  });

  it("should show node search results page", () => {
    page.search.get().type(node.label);

    page.search.enter();

    const nodeSearchResultsPage = new KgNodeSearchResultsPage(node.label);

    nodeSearchResultsPage.assertLoaded();
  });
});
