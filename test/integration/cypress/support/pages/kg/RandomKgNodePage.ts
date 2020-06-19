import {Page} from "../Page";
import {TestData} from "../../TestData";

export class RandomKgNodePage extends Page {
  readonly relativeUrl = `/kg/${TestData.kgId}/randomNode`;
}
