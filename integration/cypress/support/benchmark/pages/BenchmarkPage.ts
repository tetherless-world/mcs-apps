import { Page } from "../../Page";
import { BenchmarkSubmissionsTable } from "./BenchmarkSubmissionsTable";

class BenchmarkDatasetTableRow {
  constructor(readonly datasetId: string) {
    this.selector = `[data-cy=dataset-${datasetId}]`;
  }

  readonly selector: string;

  get name() {
    return cy.get(this.selector + " [data-cy=dataset-name]");
  }

  get questionsCount() {
    return cy.get(this.selector + " [data-cy=dataset-questions-count]");
  }

  get submissionsCount() {
    return cy.get(this.selector + " [data-cy=dataset-submissions-count]");
  }
}

class BenchmarkDatasetsTable {
  dataset(datasetId: string) {
    return new BenchmarkDatasetTableRow(datasetId);
  }
}

export class BenchmarkPage extends Page {
  constructor(readonly benchmarkId: string) {
    super();
  }

  get benchmarkName() {
    return cy.get("[data-cy=benchmark-frame-title]");
  }

  get datasetsTable() {
    return new BenchmarkDatasetsTable();
  }

  get submissions() {
    return new BenchmarkSubmissionsTable();
  }

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/`;
}
