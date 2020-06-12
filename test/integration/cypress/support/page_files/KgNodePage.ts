import {Page} from "./Page";

class EdgeList {
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

export enum NodePageTab {
  PredicateGrid = "predicate-grid",
  PredicateList = "predicate-list",
}

export class KgNodePage extends Page {
  constructor(private readonly nodeId: string) {
    super();
  }

  readonly relativeUrl = "/node/" + encodeURI(this.nodeId);
  readonly listRelUrl = this.relativeUrl + "/list";

  assertListLoaded() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq(this.listRelUrl);
    });
  }

  assertTabSelected(tab: NodePageTab) {
    return this.tab(tab).should("have.class", "Mui-selected");
  }

  get datasource() {
    return cy.get(this.frame.selector + " [data-cy=node-datasource]");
  }

  private tab(tab: NodePageTab) {
    return cy.get(`${this.frame.selector} [data-cy=${tab}]`);
  }

  gridEdgeList(predicate: string) {
    return new EdgeList(
      `${this.frame.selector} [data-cy=grid-${predicate}-edges]`
    );
  }

  listEdgeList(predicate: string) {
    return new EdgeList(
      `${this.frame.selector} [data-cy=list-${predicate}-edges]`
    );
  }

  get nodeTitle() {
    return cy.get(this.frame.selector + " [data-cy=node-title]");
  }

  selectTab(tab: NodePageTab) {
    return this.tab(tab).click();
  }

  visitList() {
    cy.visit(this.listRelUrl);
    this.assertListLoaded();
  }
}
