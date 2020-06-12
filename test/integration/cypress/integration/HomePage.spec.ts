import {HomePage} from "../support/page_files/HomePage";
import {TestData} from "../support/TestData";

context("Home Page", () => {
  const page = new HomePage();

  beforeEach(() => page.visit());

  it("should show total node and edge counts", () => {
    page.totalNodeCount.should("have.text", `${TestData.nodeCount} nodes`);
    // TODO: use fixture to get this
    // page.totalEdgeCount.should("have.text", `${data.edgeCount} relationships`);
  });

  it("should show all datasources", () => {
    page.search.selectedDatasource.should("have.text", "All datasources");
  });

  it("should show selected datasource", () => {
    page.search.selectDatasource(TestData.datasources[0]);

    page.search.selectedDatasource.should("have.text", TestData.datasources[0]);
  });
});
