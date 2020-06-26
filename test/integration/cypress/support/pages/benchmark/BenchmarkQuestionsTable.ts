class BenchmarkQuestionsTableRow {
  constructor(private readonly selector: string) {}

  get text() {
    return cy.get(this.selector + " [data-cy=question-text]");
  }
}

export class BenchmarkQuestionsTable {
  question(questionId: string) {
    return new BenchmarkQuestionsTableRow(
      `[data-cy=benchmark-questions] [data-cy=question-${questionId}]`
    );
  }
}
