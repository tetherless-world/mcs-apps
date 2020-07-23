import {Page} from "../../Page";
import {KgTestData} from "../KgTestData";

export class RandomKgNodePage extends Page {
  readonly relativeUrl = `/kg/${KgTestData.kgId}/randomNode`;
}
