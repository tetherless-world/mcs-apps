import {NodeSearchInput} from "./NodeSearchBox";

export abstract class Page {
  get absoluteUrl() {
    return Cypress.config().baseUrl + this.relativeUrl;
  }

  assertLoaded(subpath: string = "") {
    cy.url().should("eq", this.absoluteUrl + subpath);
  }

  readonly frame = {
    navbar: {
      get search() {
        return new NodeSearchInput("[data-cy=frame] [data-cy=navbar]");
      },
    },
    selector: "[data-cy=frame]",
    bodySelector: "[data-cy=frame] [data-cy=frame-content]",
  };

  abstract readonly relativeUrl: string;

  visit(subpath: string = "") {
    cy.visit(this.relativeUrl + subpath);
    this.assertLoaded(subpath);
  }
}
