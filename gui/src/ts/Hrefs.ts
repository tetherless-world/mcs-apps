import * as qs from "qs";
import {KgNodeSearchVariables} from "models/kg/KgNodeSearchVariables";

export class Hrefs {
  static readonly contact = "mailto:gordom6@rpi.edu";
  static readonly gitHub = "https://github.com/tetherless-world/mcs-portal";
  static readonly home = "/";
  static kg(id: string) {
    return {
      node(id: string) {
        return `/kg/${id}/node/${encodeURI(id)}`;
      },

      nodeSearch(kwds?: KgNodeSearchVariables) {
        if (!kwds) {
          return `/kg/${id}/node/search`;
        }

        const {__typename, ...searchVariables} = kwds;
        return (
          `/kg/${id}/node/search` +
          qs.stringify(searchVariables, {addQueryPrefix: true})
        );
      },

      paths: "/path",
      randomNode: "/randomNode",
    };
  }
}
