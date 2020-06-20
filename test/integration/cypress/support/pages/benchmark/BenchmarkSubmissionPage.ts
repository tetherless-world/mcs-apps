import {Page} from "../Page";

class BenchmarkQuestion {
  constructor(private readonly questionId: string) {}

  readonly selector = `[data-cy=question-${this.questionId}]`;

  get text() {
    return cy.get(this.selector + " [data-cy=question-text]");
  }
}

export class BenchmarkSubmissionPage extends Page {
  constructor(
    readonly benchmarkId: string,
    readonly datasetId: string,
    readonly submissionId: string
  ) {
    super();
  }

  question(questionId: string) {
    return new BenchmarkQuestion(questionId);
  }

  get submissionName() {
    return cy.get(`[data-cy=benchmark-frame-title]`);
  }

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/submission/${this.submissionId}`;
}
