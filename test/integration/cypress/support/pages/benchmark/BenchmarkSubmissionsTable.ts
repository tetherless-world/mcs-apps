class BenchmarkSubmissionTableRow {
  constructor(readonly submissionId: string) {
    this.selector = `[data-cy=submission-${submissionId}]`;
  }

  readonly selector: string;

  get name() {
    return cy.get(this.selector + " [data-cy=submission-name]");
  }
}

export class BenchmarkSubmissionsTable {
  submission(submissionId: string) {
    return new BenchmarkSubmissionTableRow(submissionId);
  }
}
