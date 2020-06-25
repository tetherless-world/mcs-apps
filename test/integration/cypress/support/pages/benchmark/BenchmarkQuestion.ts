export class BenchmarkQuestion {
  constructor(private readonly questionId: string) {}

  readonly selector = `[data-cy=question-${this.questionId}]`;

  get text() {
    return cy.get(this.selector + " [data-cy=question-text]");
  }
}
