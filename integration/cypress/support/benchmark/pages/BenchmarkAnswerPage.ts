import { Page } from "../../Page";
import { BenchmarkBreadcrumbs } from "./BenchmarkBreadcrumbs";
import { BenchmarkQuestionPromptType } from "../models/BenchmarkQuestion";

class BenchmarkQuestion {
  constructor(
    private readonly type: BenchmarkQuestionPromptType,
    private readonly index: number
  ) {}

  get text() {
    return cy.get(`[data-cy=${this.type.toLowerCase()}-${this.index}]`);
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

  question(type: BenchmarkQuestionPromptType, index: number) {
    return new BenchmarkQuestion(type, index);
  }

  answer(choiceId: string) {
    return {
      assertCorrectSubmissionAnswer() {
        cy.get(
          `[data-cy=question-answer-${choiceId}] [data-cy=correctSubmissionAnswerIcon]`
        );
      },
      assertCorrectChoice() {
        cy.get(
          `[data-cy=question-answer-${choiceId}] [data-cy=correctChoiceIcon]`
        );
      },
      assertSubmissionChoice() {
        cy.get(
          `[data-cy=question-answer-${choiceId}] [data-cy=submissionChoiceIcon]`
        );
      },
      text: cy.get(`[data-cy=question-answer-${choiceId}] [data-cy=text]`),
    };
  }

  readonly submission = {
    get id() {
      return cy.get("[data-cy=submissionId]");
    },
  };

  readonly relativeUrl: string = `/benchmark/${this.benchmarkId}/dataset/${this.datasetId}/submission/${this.submissionId}/question/${this.questionId}`;
}
