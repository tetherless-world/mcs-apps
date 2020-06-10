import {NodePage} from "../support/page_files/NodePage";

context("Node page", () => {
  const page = new NodePage("gui_test_data:0");

  beforeEach(() => page.visit());

  it("should have the node label in its card title", () => {
    page.nodeTitle.should("contain", "Test node 0");
  });

  it("should show edges by predicate", () => {
    // TODO: use fixture to get this
    // page.edgeList("/r/IsA").edges.contains("Test node 414");
  });

  it("should show the node datasource", () => {
    page.datasource.should("have.text", "gui_test_data");
  });
});
