import * as qs from "qs";
import {NodeSearchVariables} from "models/NodeSearchVariables";

export class Hrefs {
  static get contact() {
    return "mailto:gordom6@rpi.edu";
  }

  static get gitHub() {
    return "https://github.com/tetherless-world/mcs-portal";
  }

  static get home() {
    return "/";
  }

  static node(id: string) {
    return "/node/" + encodeURI(id);
  }

  static nodeSearch(kwds?: NodeSearchVariables) {
    return (
      "/node/search" + (kwds ? qs.stringify(kwds, {addQueryPrefix: true}) : "")
    );
  }

  static get randomNode() {
    return "/randomNode";
  }
}
