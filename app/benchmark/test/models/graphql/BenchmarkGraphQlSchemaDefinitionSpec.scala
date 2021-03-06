package models.graphql

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.benchmark.data.TestBenchmarkData
import org.scalatestplus.play.PlaySpec
import play.api.libs.json.{JsObject, Json}
import play.api.test.FakeRequest
import sangria.ast.Document
import sangria.execution.Executor
import sangria.macros._
import sangria.marshalling.playJson._
import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore
import stores.TestBenchmarkStore

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class BenchmarkGraphQlSchemaDefinitionSpec extends PlaySpec {
  private val KgId = "test"

  "GraphQL schema" must {
    "get benchmarks" in {
      val query =
        graphql"""
          query BenchmarksQuery {
            benchmarks {
              id
              name
            }
          }
          """
      val result = Json.stringify(executeQuery(query))
      for (benchmark <- TestBenchmarkData.benchmarks) {
        result must include(benchmark.id)
        result must include(benchmark.name)
      }
    }

    "get a benchmark tree" in {
      val benchmark = TestBenchmarkData.benchmarks(0)
      val query =
        graphql"""
          query BenchmarkByIdQuery($$benchmarkId: String!) {
            benchmarkById(id: $$benchmarkId) {
              datasets {
                id
                questionsCount
                questions(limit: 1000, offset: 0) {
                  choices {
                    id
                    text
                    type
                  }
                  concept
                  id
                  prompts {
                    text
                    type
                  }
                  type
                }
              }
            }
          }
          """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("benchmarkId" -> benchmark.id)))
      for (dataset <- benchmark.datasets) {
        result must include(dataset.id)
        for (question <- TestBenchmarkData.benchmarkQuestions.filter(question => question.datasetId == dataset.id)) {
          result must include(question.id)
          for (choice <- question.choices) {
            result must include(choice.text)
          }
        }
      }
    }

    "get a benchmark submission tree" in {
      val benchmark = TestBenchmarkData.benchmarks(0)
      val query =
        graphql"""
          query BenchmarkByIdQuery($$benchmarkId: String!) {
            benchmarkById(id: $$benchmarkId) {
              submissions {
                answers(limit: 1000, offset: 0) {
                  choiceId
                  questionId
                  explanation {
                    choiceAnalyses {
                      choiceId
                      questionAnswerPaths {
                        endNode {
                          id
                          labels
                        }
                        startNode {
                          id
                          labels
                        }
                        paths {
                          edges {
                            predicate
                          }
                          path
                          score
                        }
                        score
                      }
                    }
                  }
                }
                id
              }
            }
          }
          """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("benchmarkId" -> benchmark.id)))
      val submissions = TestBenchmarkData.benchmarkSubmissions.filter(submission => submission.benchmarkId == benchmark.id)
      for (submission <- submissions) {
        result must include(submission.id)
        val answers = TestBenchmarkData.benchmarkAnswers.filter(answer => answer.submissionId == submission.id)
        for (answer <- answers) {
          result must include(answer.questionId)
        }
      }
    }

    "get a benchmark dataset submission tree" in {
      val benchmark = TestBenchmarkData.benchmarks(0)
      val dataset = benchmark.datasets.find(dataset => dataset.id.endsWith("-test")).get
      val query =
        graphql"""
          query BenchmarkByIdQuery($$benchmarkId: String!, $$benchmarkDatasetId: String!) {
            benchmarkById(id: $$benchmarkId) {
              datasetById(id: $$benchmarkDatasetId) {
                submissions {
                  answers(limit: 1000, offset: 0) {
                    choiceId
                    questionId
                  }
                  id
                }
                submissionsCount
              }
            }
          }
          """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("benchmarkId" -> benchmark.id, "benchmarkDatasetId" -> dataset.id)))
      val submissions = TestBenchmarkData.benchmarkSubmissions.filter(submission => submission.benchmarkId == benchmark.id && submission.datasetId == dataset.id)
      submissions must not be empty
      result must include(s"""submissionsCount":${submissions.size}""")
      for (submission <- submissions) {
        result must include(submission.id)
        val answers = TestBenchmarkData.benchmarkAnswers.filter(answer => answer.submissionId == submission.id)
        for (answer <- answers) {
          result must include(answer.questionId)
        }
      }
    }
  }

  def executeQuery(query: Document, vars: JsObject = Json.obj()) = {
    val futureResult = Executor.execute(BenchmarkGraphQlSchemaDefinition.schema, query,
      variables = vars,
      userContext = new BenchmarkGraphQlSchemaContext(new TestBenchmarkStore, new TestKgStore(), FakeRequest())
    )
    Await.result(futureResult, 10.seconds)
  }
}
