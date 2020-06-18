import {Page} from "./Page";

export class BenchmarkPage extends Page {
  constructor(readonly benchmarkId: String) {
    super();
  }

  get benchmarkName() {
    return cy.get("[data-cy=benchmark-name]");
  }

  datasetName(datasetId: string) {
    return cy.get(`[data-cy=dataset-name-${datasetId}]`);
  }

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/`;
}
