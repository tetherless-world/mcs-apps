import * as qs from "qs";
import {KgNodeSearchVariables} from "models/kg/KgNodeSearchVariables";

export class Hrefs {
  static readonly contact = "mailto:gordom6@rpi.edu";
  static readonly gitHub = "https://github.com/tetherless-world/mcs-portal";
  static readonly home = "/";
  static readonly benchmarks = "/benchmarks";
  static readonly kgRoot = "/kg";
  static kg(id: string) {
    const kgId = id;
    return {
      node(id: string) {
        return `${Hrefs.kgRoot}/${kgId}/node/${encodeURI(id)}`;
      },

      nodeSearch(kwds?: KgNodeSearchVariables) {
        if (!kwds) {
          return `${Hrefs.kgRoot}/${kgId}/node/search`;
        }

        const {__typename, ...searchVariables} = kwds;
        return (
          `${Hrefs.kgRoot}/${kgId}/node/search` +
          qs.stringify(searchVariables, {addQueryPrefix: true})
        );
      },

      paths: `${Hrefs.kgRoot}/${kgId}/path`,
      randomNode: `${Hrefs.kgRoot}/${kgId}/randomNode`,
    };
  }
}
