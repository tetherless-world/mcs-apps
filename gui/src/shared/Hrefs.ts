import * as qs from "qs";
import {KgSearchVariables} from "shared/models/kg/node/KgNodeSearchVariables";
import * as _ from "lodash";

export class Hrefs {
  static readonly contact = "mailto:gordom6@rpi.edu";
  static readonly gitHub = "https://github.com/tetherless-world/mcs-apps";
  static readonly home = "/";
  static kg(kwds: {id: string; idEncoded?: boolean}) {
    const kgId = kwds.idEncoded ? kwds.id : encodeURIComponent(kwds.id);
    const kgPrefix = `/kg/${kgId}/`;
    return {
      get home() {
        return kgPrefix;
      },

      node(kwds: {id: string; idEncoded?: boolean}) {
        const nodeId = kwds.idEncoded ? kwds.id : encodeURIComponent(kwds.id);
        return kgPrefix + `node/${nodeId}`;
      },

      nodeSearch(kwds?: KgSearchVariables) {
        if (!kwds) {
          return kgPrefix + "node/search";
        }

        const {__typename, ...searchVariables} = kwds;

        const query = searchVariables.query;
        if (query && _.isEmpty(query.filters)) {
          delete query.filters;
        }

        return (
          kgPrefix +
          "node/search" +
          qs.stringify(
            {
              limit: searchVariables.limit,
              offset: searchVariables.offset,
              query: !_.isEmpty(query) ? JSON.stringify(query) : undefined,
            },
            {addQueryPrefix: true}
          )
        );
      },

      randomNode: kgPrefix + "randomNode",
    };
  }
}
