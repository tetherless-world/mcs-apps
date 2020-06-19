import {Page} from "../Page";
import {KgNodeSearchBox} from "./KgNodeSearchBox";

export class KgHomePage extends Page {
  get totalNodeCount() {
    return cy.get(this.frame.bodySelector + " [data-cy=totalNodeCount]");
  }

  get totalEdgeCount() {
    return cy.get(this.frame.bodySelector + " [data-cy=totalEdgeCount]");
  }

  get search() {
    return new KgNodeSearchBox(this.frame.bodySelector);
  }

  readonly relativeUrl: string = "/kg/";
}
