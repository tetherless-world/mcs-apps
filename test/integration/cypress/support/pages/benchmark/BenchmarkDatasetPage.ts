import {Page} from "../Page";
import {BenchmarkSubmissionsTable} from "./BenchmarkSubmissionsTable";

export class BenchmarkDatasetPage extends Page {
  constructor(readonly benchmarkId: string, readonly datasetId: string) {
    super();
  }

  get datasetName() {
    return cy.get(`[data-cy=benchmark-frame-title]`);
  }

  get submissionsTable() {
    return new BenchmarkSubmissionsTable();
  }

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/`;
}
