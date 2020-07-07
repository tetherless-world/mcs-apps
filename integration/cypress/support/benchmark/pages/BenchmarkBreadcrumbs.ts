export class BenchmarkBreadcrumbs {
  constructor(readonly selector: string) {}

  toBenchmarks() {
    cy.get(this.selector + " [data-cy=benchmarks]").click();
  }

  toBenchmark() {
    cy.get(this.selector + " [data-cy=benchmark]").click();
  }

  toDatasets() {
    cy.get(this.selector + " [data-cy=datasets]").click();
  }

  toDataset() {
    cy.get(this.selector + " [data-cy=dataset]").click();
  }

  toSubmission() {
    cy.get(this.selector + " [data-cy=submission]").click();
  }

  toQuestion() {
    cy.get(this.selector + " [data-cy=question]").click();
  }
}
