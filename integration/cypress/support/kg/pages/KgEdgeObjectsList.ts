export class KgEdgeObjectsList {
  constructor(private readonly selector: string) {}

  get edges() {
    return cy.get(this.selector + " [data-cy=edge]");
  }

  get list() {
    return cy.get(this.selector);
  }

  get title() {
    return cy.get(this.selector + " [data-cy=edge-list-title]");
  }
}
