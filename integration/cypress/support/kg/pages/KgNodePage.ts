import {Page} from "../../Page";
import {KgTestData} from "../KgTestData";

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

export enum KgNodePageTab {
  PredicateGrid = "predicate-grid",
  PredicateList = "predicate-list",
}

export class KgNodePage extends Page {
  constructor(private readonly nodeId: string) {
    super();
  }

  readonly relativeUrl = `/kg/${KgTestData.kgId}/node/${encodeURIComponent(
    this.nodeId
  )}`;
  readonly listRelUrl = this.relativeUrl + "/list";

  assertListLoaded() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq(this.listRelUrl);
    });
  }

  assertTabSelected(tab: KgNodePageTab) {
    return this.tab(tab).should("have.class", "Mui-selected");
  }

  get datasource() {
    return cy.get(this.frame.selector + " [data-cy=node-source]");
  }

  private tab(tab: KgNodePageTab) {
    return cy.get(`${this.frame.selector} [data-cy=${tab}]`);
  }

  gridEdgeList(predicate: string) {
    return new EdgeList(
      `${this.frame.selector} [data-cy="grid-${predicate}-edges"]`
    );
  }

  listEdgeList(predicate: string) {
    return new EdgeList(
      `${this.frame.selector} [data-cy="list-${predicate}-edges"]`
    );
  }

  get nodeTitle() {
    return cy.get(this.frame.selector + " [data-cy=node-title]");
  }

  selectTab(tab: KgNodePageTab) {
    return this.tab(tab).click();
  }

  visitList() {
    cy.visit(this.listRelUrl);
    this.assertListLoaded();
  }
}
