import {KgTestData} from "../KgTestData";
import {TabbedPage} from "./TabbedPage";
import {KgNodeLabelPageTab} from "./KgNodeLabelPageTab";

export class KgNodeLabelPage extends TabbedPage<KgNodeLabelPageTab> {
  constructor(private readonly nodeLabel: string) {
    super();
  }

  readonly relativeUrl = `/kg/${KgTestData.kgId}/nodeLabel/${encodeURIComponent(
    this.nodeLabel
  )}`;
}
