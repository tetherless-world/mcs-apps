import {Page} from "../Page";
import {BenchmarkBreadcrumbs} from "./BenchmarkBreadcrumbs";
import {BenchmarkQuestion} from "./BenchmarkQuestion";

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

  question(questionId: string) {
    return new BenchmarkQuestion(questionId);
  }

  answer(choiceId: string) {
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
      id: cy
        .get("[data-cy=questionAnswer] [data-cy=id]")
        .contains(new RegExp(`^${choiceId}$`))
        .parentsUntil("[data-cy=questionAnswer]")
        .find("[data-cy=label]"),
      text: cy
        .get("[data-cy=questionAnswer] [data-cy=id]")
        .contains(new RegExp(`^${choiceId}$`))
        .parentsUntil("[data-cy=questionAnswer]")
        .find("[data-cy=text]"),
    };
  }

  readonly submission = {
    get id() {
      return cy.get("[data-cy=submissionId]");
    },
  };

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/submission/${this.submissionId}/question/${this.questionId}`;
}
