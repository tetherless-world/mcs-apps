import { Page } from "../../Page";
import { TestData } from "../KgTestData";

export class RandomKgNodePage extends Page {
  readonly relativeUrl = `/kg/${TestData.kgId}/randomNode`;
}
