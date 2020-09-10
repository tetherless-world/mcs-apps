import {Page} from "../../Page";

export abstract class TabbedPage<
  TabIdT extends {toString(): string}
> extends Page {
  assertTabLoaded(tab: TabIdT) {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq(this.relativeUrl + "/" + this.getTabPath(tab));
    });
  }

  assertTabSelected(tab: TabIdT) {
    return this.tab(tab).should("have.class", "Mui-selected");
  }

  protected getTabPath(tab: TabIdT): string {
    return tab.toString();
  }

  private tab(tab: TabIdT) {
    return cy.get(`${this.frame.selector} [data-cy=${tab}]`);
  }

  selectTab(tab: TabIdT) {
    return this.tab(tab).click();
  }

  visitTab(tab: TabIdT) {
    cy.visit(this.relativeUrl + "/" + this.getTabPath(tab));
    this.assertTabLoaded(tab);
  }
}
