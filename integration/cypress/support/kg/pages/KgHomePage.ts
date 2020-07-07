import { Page } from "../../Page";
import { KgNodeSearchBox } from "./KgNodeSearchBox";

export class KgHomePage extends Page {
  get search() {
    return new KgNodeSearchBox(this.frame.bodySelector);
  }

  readonly relativeUrl: string = "/kg/";
}
