import {Page} from "../Page";
import {BenchmarkBreadcrumbs} from "./BenchmarkBreadcrumbs";

class Answer {
  constructor(private readonly selector: string) {}

  get label() {
    return cy.get(this.selector + " [data-cy=label]");
  }

  get text() {
    return cy.get(this.selector + " [data-cy=text]");
  }
}

export class BenchmarkAnswerPage extends Page {
  constructor(
    private readonly benchmarkId: string,
    private readonly datasetId: string,
    private readonly submissionId: string,
    private readonly questionId: string
  ) {
    super();
  }

  get breadcrumbs() {
    return new BenchmarkBreadcrumbs("[data-cy=breadcrumbs]");
  }

  readonly question = {
    get text() {
      return cy.get("[data-cy=questionText]");
    },

    answer(choiceLabel: string) {
      return {
        label: cy
          .get("[data-cy=questionAnswer] [data-cy=label]")
          .contains(new RegExp(`^${choiceLabel}$`))
          .parentsUntil("[data-cy=questionAnswer]")
          .find("[data-cy=label]"),
        text: cy
          .get("[data-cy=questionAnswer] [data-cy=label]")
          .contains(new RegExp(`^${choiceLabel}$`))
          .parentsUntil("[data-cy=questionAnswer]")
          .find("[data-cy=text]"),
      };
    },
  };

  readonly submission = {
    get id() {
      return cy.get("[data-cy=submissionId]");
    },

    answer: new Answer("[data-cy=submissionAnswer]"),
  };

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/submission/${this.submissionId}/question/${this.questionId}`;
}
