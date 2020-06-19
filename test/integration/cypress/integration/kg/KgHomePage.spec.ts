import {KgHomePage} from "../../support/pages/kg/KgHomePage";
import {TestData} from "../../support/TestData";

context("KG Home Page", () => {
  const page = new KgHomePage();

  beforeEach(() => page.visit());

  it("should show total node and edge counts", () => {
    TestData.nodes.then((nodes) => {
      page.totalNodeCount.should("have.text", `${nodes.length} nodes`);
    });
    TestData.edges.then((edges) => {
      page.totalEdgeCount.should("have.text", `${edges.length} relationships`);
    });
  });

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
});
