import {KgNodeSearchResultsPage} from "../support/page_files/KgNodeSearchResultsPage";
import {KgNodePage} from "../support/page_files/KgNodePage";
import {KgHomePage} from "../support/page_files/KgHomePage";

context("Navigate to test KgNodePage from HomePage using search", () => {
  const homePage = new KgHomePage();

  beforeEach(() => {
    homePage.visit();

    homePage.search.get().type("Test node 0");
  });

  afterEach(() => {
    const nodePage = new KgNodePage("portal_test_data:0");

    nodePage.assertLoaded();
  });

  it("Use search suggestions to reach node page", () => {
    homePage.search.suggestion(0).get().click();
  });

  it("Use all results to reach node page", () => {
    homePage.search.enter();

    const nodeSearchResultsPage = new KgNodeSearchResultsPage("Test node 0");

    nodeSearchResultsPage.assertLoaded();

    nodeSearchResultsPage.visualizationContainer.contains(
      '1000 results for "Test node 0"'
    );

    nodeSearchResultsPage.resultsTable.row(0).nodeLink.click();
  });
});
