package models.graphql

import org.scalatestplus.play.PlaySpec
import play.api.libs.json.{JsObject, Json}
import play.api.test.FakeRequest
import sangria.ast.Document
import sangria.execution.Executor
import sangria.macros._
import sangria.marshalling.playJson._
import stores.Stores
import stores.benchmark.TestBenchmarkStore
import stores.kg.{KgTestData, TestKgStore}

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class GraphQlSchemaDefinitionSpec extends PlaySpec {
  private val KgId = "test"

  "GraphQL schema" must {
    "get a KG node by id" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query KgNodeByIdQuery($$kgId: String!, $$nodeId: String!) {
           kg(id: $$kgId) {
             nodeById(id: $$nodeId) {
              label
             }
           }
         }
       """

      executeQuery(query, vars = Json.obj("kgId" -> KgId, "nodeId" -> node.id)) must be(Json.parse(
        s"""
           |{"data":{"kg":{"nodeById":{"label":"${node.label}"}}}}
           |""".stripMargin))
    }

    "get KG edges the node is a subject of" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query KgEdgesQuery($$kgId: String!, $$nodeId: String!) {
           kg(id: $$kgId) {
             nodeById(id: $$nodeId) {
               subjectOfEdges(limit: 10000, offset: 0) {
                 predicate
                 object
                 objectNode {
                   label
                 }
               }
             }
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "nodeId" -> node.id)))
      for (edge <- KgTestData.edges.filter(edge => edge.subject == node.id)) {
        result must include(s"""{"predicate":"${edge.predicate}","object":"${edge.`object`}"""")
      }
    }

    "get KG edges the node is an object of" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query KgEdgesQuery($$kgId: String!, $$nodeId: String!) {
           kg(id: $$kgId) {
             nodeById(id: $$nodeId) {
               objectOfEdges(limit: 10000, offset: 0) {
                 predicate
                 subject
               }
             }
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "nodeId" -> node.id)))
      result must include("""{"data":{"kg":{"nodeById":{"objectOfEdges":[{"predicate"""")
    }

    "get a random KG node" in {
        val query =
          graphql"""
         query RandomKgNodeQuery($$kgId: String!) {
           kg(id: $$kgId) {
             randomNode {
              id
              label
             }
           }
         }
       """

        val results = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId)))
        results must include("""{"data":{"kg":{"randomNode":{"id":"""")
    }

    "search KG nodes" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query MatchingKgNodesQuery($$kgId: String!, $$text: String!) {
           kg(id: $$kgId) {
             matchingNodes(text: $$text, limit: 1, offset: 0) {
              id
             }
             matchingNodesCount(text: $$text)
           }
         }
       """

      executeQuery(query, vars = Json.obj("kgId" -> KgId, "text" -> s"""label:"${node.label}"""")) must be(Json.parse(
        s"""
           |{"data":{"kg":{"matchingNodes":[{"id":"${node.id}"}],"matchingNodesCount":1}}}
           |""".stripMargin))
    }

    "get total KG node and edge count" in {
      val nodeCount = KgTestData.nodes.size
      val edgeCount = KgTestData.edges.size
      val query =
        graphql"""
          query TotalKgCountsQuery($$kgId: String!) {
            kg(id: $$kgId) {
              totalNodesCount
              totalEdgesCount
            }
          }
        """

      executeQuery(query, vars = Json.obj("kgId" -> KgId)) must be(Json.parse(
        s"""{"data":{"kg":{"totalNodesCount":${nodeCount},"totalEdgesCount":${edgeCount}}}}"""
      ))
    }

    "get KG paths" in {
      val query =
        graphql"""
          query KgPathsQuery($$kgId: String!) {
            kg(id: $$kgId) {
              paths {
                id
              }
            }
          }
        """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId)))
      for (path <- KgTestData.paths) {
        result must include(path.id)
      }
    }

    "get path by id" in {
      val query =
        graphql"""
          query PathQuery($$kgId: String!, $$pathId: String!) {
            kg(id: $$kgId) {
              pathById(id: $$pathId) {
                  path
              }
            }
          }
        """

      val path = KgTestData.paths(0)
      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "pathId" -> path.id)))
      for (pathComponent <- path.path) {
        result must include(pathComponent)
      }
    }

    "get path edges and their nodes" in {
      val query =
        graphql"""
        query PathQuery($$kgId: String!, $$pathId: String!) {
          kg(id: $$kgId) {
            pathById(id: $$pathId) {
              edges {
                objectNode {
                  label
                }
                predicate
                subjectNode {
                  label
                }
              }
            }
          }
        }
      """

      val path = KgTestData.paths(0)
      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "pathId" -> path.id)))
      for (pathEdge <- path.edges) {
        val presentEdge = KgTestData.edges.find(edge => edge.subject == pathEdge.subject && edge.predicate == pathEdge.predicate && edge.`object` == pathEdge.`object`)
        presentEdge must not be(None)
        val subjectNode = KgTestData.nodesById(pathEdge.subject)
        val objectNode = KgTestData.nodesById(pathEdge.`object`)
        result must include(subjectNode.label)
        result must include(objectNode.label)
        result must include(pathEdge.predicate)
      }
    }
  }

  def executeQuery(query: Document, vars: JsObject = Json.obj()) = {
    val futureResult = Executor.execute(GraphQlSchemaDefinition.schema, query,
      variables = vars,
      userContext = new GraphQlSchemaContext(FakeRequest(), new Stores(benchmarkStore = new TestBenchmarkStore(), kgStore = new TestKgStore()))
    )
    Await.result(futureResult, 10.seconds)
  }
}
