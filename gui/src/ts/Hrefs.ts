import * as qs from "qs";
import {KgNodeSearchVariables} from "models/kg/KgNodeSearchVariables";

export class Hrefs {
  static benchmarks = `/benchmark/`;
  static benchmark(kwds: {id: string; idEncoded?: boolean}) {
    const benchmarkId = kwds.idEncoded ? kwds.id : encodeURIComponent(kwds.id);
    const benchmarkPrefix = `${Hrefs.benchmarks}${benchmarkId}/`;
    return {
      get home() {
        return benchmarkPrefix;
      },

      dataset(kwds: {id: string; idEncoded?: boolean}) {
        const datasetId = kwds.idEncoded
          ? kwds.id
          : encodeURIComponent(kwds.id);
        const datasetPrefix = benchmarkPrefix + `dataset/${datasetId}/`;
        return {
          get home() {
            return datasetPrefix;
          },

          submission(kwds: {id: string; idEncoded?: boolean}) {
            const submissionId = kwds.idEncoded
              ? kwds.id
              : encodeURIComponent(kwds.id);
            const submissionPrefix =
              datasetPrefix + `submission/${submissionId}/`;
            return {
              get home() {
                return submissionPrefix;
              },

              question(kwds: {id: string; idEncoded?: boolean}) {
                const questionId = kwds.idEncoded
                  ? kwds.id
                  : encodeURIComponent(kwds.id);
                return submissionPrefix + `question/${questionId}`;
              },
            };
          },
        };
      },
    };
  }

  static readonly contact = "mailto:gordom6@rpi.edu";
  static readonly gitHub = "https://github.com/tetherless-world/mcs-portal";
  static readonly home = "/";
  static readonly kgs = "/kg/";
  static kg(kwds: {id: string; idEncoded?: boolean}) {
    const kgId = kwds.idEncoded ? kwds.id : encodeURIComponent(kwds.id);
    const kgPrefix = `${Hrefs.kgs}${kgId}/`;
    return {
      get home() {
        return kgPrefix;
      },

      node(kwds: {id: string; idEncoded?: boolean}) {
        const nodeId = kwds.idEncoded ? kwds.id : encodeURIComponent(kwds.id);
        return kgPrefix + `node/${nodeId}`;
      },

      nodeSearch(kwds?: KgNodeSearchVariables) {
        if (!kwds) {
          return kgPrefix + "node/search";
        }

        const {__typename, ...searchVariables} = kwds;
        return (
          kgPrefix +
          "node/search" +
          qs.stringify(searchVariables, {addQueryPrefix: true})
        );
      },

      paths: kgPrefix + "path",
      randomNode: kgPrefix + "randomNode",
    };
  }
}
