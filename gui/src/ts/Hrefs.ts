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
    if (!kwds) {
      return "/node/search";
    }

    const {__typename, ...searchVariables} = kwds;
    return (
      "/node/search" + qs.stringify(searchVariables, {addQueryPrefix: true})
    );
  }

  static get paths() {
    return "/path";
  }

  static get randomNode() {
    return "/randomNode";
  }
}
