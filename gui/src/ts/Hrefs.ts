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

      questionSet(kwds: {id: string; idEncoded?: boolean}) {
        const questionSetId = kwds.idEncoded
          ? kwds.id
          : encodeURIComponent(kwds.id);
        const questionSetPrefix =
          benchmarkPrefix + `questionSet/${questionSetId}/`;
        return {
          get home() {
            return questionSetPrefix;
          },

          submission(kwds: {id: string; idEncoded?: boolean}) {
            const submissionId = kwds.idEncoded
              ? kwds.id
              : encodeURIComponent(kwds.id);
            const submissionPrefix =
              questionSetPrefix + `submission/${submissionId}/`;
            return {
              get home() {
                return submissionPrefix;
              },

              answer(kwds: {id: string; idEncoded?: boolean}) {
                const answerId = kwds.idEncoded
                  ? kwds.id
                  : encodeURIComponent(kwds.id);
                return submissionPrefix + `answer/${answerId}`;
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
