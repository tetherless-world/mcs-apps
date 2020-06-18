import {Page} from "./Page";
import {BenchmarkSubmissionsTable} from "./BenchmarkSubmissionsTable";

export class BenchmarkPage extends Page {
  constructor(readonly benchmarkId: String) {
    super();
  }

  get benchmarkName() {
    return cy.get("[data-cy=benchmark-name]");
  }

  get benchmarksLink() {
    return cy.get("[data-cy=benchmarks-link]");
  }

  datasetName(datasetId: string) {
    return cy.get(`[data-cy=dataset-name-${datasetId}]`);
  }

  get submissionsTable() {
    return new BenchmarkSubmissionsTable();
  }

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/`;
}
