import * as qs from "qs";
import {KgNodeSearchVariables} from "models/KgNodeSearchVariables";

export class Hrefs {
  static readonly contact = "mailto:gordom6@rpi.edu";
  static readonly gitHub = "https://github.com/tetherless-world/mcs-portal";
  static readonly home = "/";
  static readonly kg = {
    node(id: string) {
      return "/node/" + encodeURI(id);
    },

    nodeSearch(kwds?: KgNodeSearchVariables) {
      if (!kwds) {
        return "/node/search";
      }

      const {__typename, ...searchVariables} = kwds;
      return (
        "/node/search" + qs.stringify(searchVariables, {addQueryPrefix: true})
      );
    },

    paths: "/path",
    randomNode: "/randomNode",
  };
}
