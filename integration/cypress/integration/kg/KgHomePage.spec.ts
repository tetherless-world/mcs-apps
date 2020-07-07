import {KgHomePage} from "../../support/pages/kg/KgHomePage";
import {TestData} from "../../support/TestData";
import {KgNodePage} from "../../support/pages/kg/KgNodePage";
import {KgNode} from "../../support/models/kg/KgNode";
import {KgNodeSearchResultsPage} from "../../support/pages/kg/KgNodeSearchResultsPage";

context("KG Home Page", () => {
  const page = new KgHomePage();
  let node: KgNode;

  before(() => {
    TestData.kgNodes.then((nodes) => {
      node = nodes[0];
    });
  });

  beforeEach(() => page.visit());

  it("should show all datasources", () => {
    page.search.selectedDatasource.should("have.text", "All datasources");
  });

  it("should show selected datasource", () => {
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
