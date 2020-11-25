import {Hrefs as SharedHrefs} from "shared/Hrefs";

export class BenchmarkHrefs extends SharedHrefs {
  readonly benchmarks = `${this.base}benchmark/`;
  benchmark(kwds: {id: string; idEncoded?: boolean}) {
    const benchmarkId = kwds.idEncoded ? kwds.id : encodeURIComponent(kwds.id);
    const benchmarkPrefix = `${this.benchmarks}${benchmarkId}/`;
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
}
