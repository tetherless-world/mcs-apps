import * as qs from "qs";
import {KgNodeSearchVariables} from "models/kg/KgNodeSearchVariables";

export class Hrefs {
  static readonly contact = "mailto:gordom6@rpi.edu";
  static readonly gitHub = "https://github.com/tetherless-world/mcs-portal";
  static readonly home = "/";
  static kg(id: string) {
    const kgId = id;
    return {
      node(id: string) {
        return `/kg/${kgId}/node/${encodeURI(id)}`;
      },

      nodeSearch(kwds?: KgNodeSearchVariables) {
        if (!kwds) {
          return `/kg/${kgId}/node/search`;
        }

        const {__typename, ...searchVariables} = kwds;
        return (
          `/kg/${kgId}/node/search` +
          qs.stringify(searchVariables, {addQueryPrefix: true})
        );
      },

      paths: `/kg/${kgId}/path`,
      randomNode: `/kg/${kgId}/randomNode`,
    };
  }
}
