import {RandomKgNodePage} from "../support/page_files/RandomKgNodePage";

context("Random KG node page", () => {
  const page = new RandomKgNodePage();

  it("should immediately redirect to a node page", () => {
    cy.visit(page.relativeUrl);
    cy.url().should("contains", Cypress.config().baseUrl + "/node/");
  });
});
