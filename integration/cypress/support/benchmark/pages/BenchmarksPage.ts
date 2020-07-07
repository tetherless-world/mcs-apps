import { Page } from "../../Page";

export class BenchmarksPage extends Page {
  benchmark(benchmarkId: string) {
    return cy.get(`[data-cy="benchmark-${benchmarkId}"]`);
  }

  readonly relativeUrl: string = `/benchmark/`;
}
