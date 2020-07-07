import {Page} from "../Page";
import {BenchmarkSubmissionsTable} from "./BenchmarkSubmissionsTable";
import {BenchmarkQuestionsTable} from "./BenchmarkQuestionsTable";

export class BenchmarkDatasetPage extends Page {
  constructor(readonly benchmarkId: string, readonly datasetId: string) {
    super();
  }

  get datasetName() {
    return cy.get(`[data-cy=benchmark-frame-title]`);
  }

  get questions() {
    return new BenchmarkQuestionsTable();
  }

  get submissions() {
    return new BenchmarkSubmissionsTable();
  }

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/`;
}
