import {Page} from "../Page";
import {BenchmarkBreadcrumbs} from "./BenchmarkBreadcrumbs";

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
        assertCorrectSubmissionAnswer() {
          cy.get(
            "[data-cy=questionAnswer] [data-cy=correctSubmissionAnswerIcon]"
          );
        },
        assertCorrectChoice() {
          cy.get("[data-cy=questionAnswer] [data-cy=correctChoiceIcon]");
        },
        assertSubmissionChoice() {
          cy.get("[data-cy=questionAnswer] [data-cy=submissionChoiceIcon]");
        },
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
  };

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/submission/${this.submissionId}/question/${this.questionId}`;
}
