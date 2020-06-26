class BenchmarkQuestionsTableRow {
  constructor(private readonly selector: string) {}

  get text() {
    return cy.get(this.selector + " [data-cy=question-text]");
  }
}

export class BenchmarkQuestionsTable {
  constructor(readonly selector: string) {}

  question(questionId: string) {
    return new BenchmarkQuestionsTableRow(
      `${this.selector} [data-cy=question-${questionId}]`
    );
  }
}
