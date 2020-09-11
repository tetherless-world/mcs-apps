import {Page} from "../../Page";
import {KgSearchBox} from "./KgSearchBox";

export class KgHomePage extends Page {
  get search() {
    return new KgSearchBox(this.frame.bodySelector);
  }

  readonly relativeUrl: string = "/";
}
