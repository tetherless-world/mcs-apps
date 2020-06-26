import {Page} from "../Page";
import {BenchmarkQuestionsTable} from "./BenchmarkQuestionsTable";

export class BenchmarkSubmissionPage extends Page {
  constructor(
    readonly benchmarkId: string,
    readonly datasetId: string,
    readonly submissionId: string
  ) {
    super();
  }

  get questions() {
    return new BenchmarkQuestionsTable();
  }

  get submissionName() {
    return cy.get(`[data-cy=benchmark-frame-title]`);
  }

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/submission/${this.submissionId}/`;
}
