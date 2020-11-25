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
      case KgNodePageTab.Edges:
        return "edges";
      default:
        throw new EvalError();
    }
  }

  edges(predicate: string) {
    return new KgEdgeObjectsList(
      `${this.frame.selector} [data-cy="grid-${predicate}-edges"]`
    );
  }

  get nodeTitle() {
    return cy.get(this.frame.selector + " [data-cy=node-title]");
  }

  readonly relativeUrl = `/kg/${KgTestData.kgId}/node/${encodeURIComponent(
    this.nodeId
  )}`;

  source(id: string) {
    return cy.get(`${this.frame.selector} [data-cy=node-source-${id}]`);
  }
}
