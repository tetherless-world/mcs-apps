import {KgTestData} from "../KgTestData";
import {KgEdgeObjectsList} from "./KgEdgeObjectsList";
import {TabbedPage} from "./TabbedPage";
import {KgNodePageTab} from "./KgNodePageTab";

export class KgNodePage extends TabbedPage<KgNodePageTab> {
  constructor(private readonly nodeId: string) {
    super();
  }

  protected getTabPath(tab: KgNodePageTab): string {
    switch (tab) {
      case KgNodePageTab.EdgesGrid:
        return "grid";
      case KgNodePageTab.EdgesList:
        return "list";
      default:
        throw new EvalError();
    }
  }

  gridEdgeList(predicate: string) {
    return new KgEdgeObjectsList(
      `${this.frame.selector} [data-cy="grid-${predicate}-edges"]`
    );
  }

  listEdgeList(predicate: string) {
    return new KgEdgeObjectsList(
      `${this.frame.selector} [data-cy="list-${predicate}-edges"]`
    );
  }

  get nodeTitle() {
    return cy.get(this.frame.selector + " [data-cy=node-title]");
  }

  readonly relativeUrl = `/kg/${KgTestData.kgId}/node/${encodeURIComponent(
    this.nodeId
  )}`;

  get source() {
    return cy.get(this.frame.selector + " [data-cy=node-source]");
  }
}
