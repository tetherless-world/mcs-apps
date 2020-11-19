import {KgTestData} from "../KgTestData";
import {TabbedPage} from "./TabbedPage";
import {KgNodeLabelPageTab} from "./KgNodeLabelPageTab";

export class KgNodeLabelPage extends TabbedPage<KgNodeLabelPageTab> {
  constructor(private readonly nodeLabel: string) {
    super();
  }

  get nodeLabelTitle() {
    return cy.get(this.frame.selector + " [data-cy=node-label-title]");
  }

  readonly relativeUrl = `/kg/${KgTestData.kgId}/nodeLabel/${encodeURIComponent(
    this.nodeLabel
  )}`;

  source(id: string) {
    return cy.get(`${this.frame.selector} [data-cy=node-source-${id}]`);
  }
}
