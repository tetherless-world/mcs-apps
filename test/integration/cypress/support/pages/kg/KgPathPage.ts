import {Page} from "../Page";
import {TestData} from "../../TestData";

class KgPathTable {
  constructor(public readonly selector: string) {}

  get() {
    return cy.get(this.selector);
  }

  edge(index: number) {
    return this.get().find(`[data-cy=edge-${index}]`);
  }
}

class KgPathsTable {
  constructor(public readonly selector: string) {}

  get() {
    return cy.get(this.selector);
  }

  path(id: string) {
    return this.get().find(`[data-cy=path-${id}]`);
  }
}

export class KgPathPage extends Page {
  readonly relativeUrl = `/kg/${TestData.kgId}/path`;

  get pathTable() {
    return new KgPathTable(this.frame.selector + " [data-cy=kg-path-table]");
  }

  get pathsTable() {
    return new KgPathsTable(this.frame.selector + " [data-cy=kg-paths-table]");
  }

  assertPathLoaded(id: string) {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq(
        this.relativeUrl + "/" + encodeURIComponent(id)
      );
    });
  }

  clickPath(id: string) {
    this.pathsTable.path(id).click();

    return this;
  }

  get allPathsButton() {
    return cy.get(this.frame.selector + " [data-cy=all-paths]");
  }

  clickAllPaths() {
    this.allPathsButton.click();
  }

  get selectedPathId() {
    return cy.get(this.frame.selector + " [data-cy=selected-path-id]");
  }

  get pathCount() {
    return cy.get(this.frame.selector + " [data-cy=path-count]");
  }
}
