import {KgNodePage, KgNodePageTab} from "../support/page_files/KgNodePage";

context("KG node page", () => {
  const page = new KgNodePage("gui_test_data:0");

  beforeEach(() => page.visit());

  it("should have the node label in its card title", () => {
    page.nodeTitle.should("contain", "Test node 0");
  });

  it("should show edges by predicate", () => {
    // TODO: use fixture to get this
    page.gridEdgeList("\\/r\\/AtLocation").list.should("exist");
  });

  it("should show the node datasource", () => {
    page.datasource.should("have.text", "gui_test_data");
  });

  it("should have the grid tab selected by default", () => {
    page.assertTabSelected(KgNodePageTab.PredicateGrid);
  });

  it("should route to the predicate list when the tab is clicked", () => {
    page.selectTab(KgNodePageTab.PredicateList);
    page.assertListLoaded();
  });

  it("should contain predicate lists in the list tab", () => {
    page.visitList();
    page.listEdgeList("\\/r\\/AtLocation").list.should("exist");
  });
});
