package models.graphql

import org.scalatestplus.play.PlaySpec
import play.api.libs.json.{JsObject, Json}
import play.api.test.FakeRequest
import sangria.ast.Document
import sangria.execution.Executor
import sangria.macros._
import sangria.marshalling.playJson._
import stores.kg.{KgTestData, TestKgStore}

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class GraphQlSchemaDefinitionSpec extends PlaySpec {
  "GraphQL schema" must {
    "get a node by id" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query NodeByIdQuery($$id: String!) {
           nodeById(id: $$id) {
            label
           }
         }
       """

      executeQuery(query, vars = Json.obj("id" -> node.id)) must be(Json.parse(
        s"""
           |{"data":{"nodeById":{"label":"${node.label}"}}}
           |""".stripMargin))
    }

    "get edges the node is a subject of" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query EdgesQuery($$nodeId: String!) {
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
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("nodeId" -> node.id)))
      for (edge <- KgTestData.edges.filter(edge => edge.subject == node.id)) {
        result must include(s"""{"predicate":"${edge.predicate}","object":"${edge.`object`}"""")
      }
    }

    "get edges the node is an object of" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query EdgesQuery($$nodeId: String!) {
           nodeById(id: $$nodeId) {
             objectOfEdges(limit: 10000, offset: 0) {
               predicate
               subject
             }
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("nodeId" -> node.id)))
      result must include("""{"data":{"nodeById":{"objectOfEdges":[{"predicate"""")
    }

    "get a random node" in {
        val query =
          graphql"""
         query RandomNodeQuery {
           randomNode {
            id
            label
           }
         }
       """

        val results = Json.stringify(executeQuery(query))
        results must include("""{"data":{"randomNode":{"id":"""")
    }

    "search nodes" in {
      val node = KgTestData.nodes(0)
      val query =
        graphql"""
         query MatchingNodesQuery($$text: String!) {
           matchingNodes(text: $$text, limit: 1, offset: 0) {
            id
           }
           matchingNodesCount(text: $$text)
         }
       """

      executeQuery(query, vars = Json.obj("text" -> s"""label:"${node.label}"""")) must be(Json.parse(
        s"""
           |{"data":{"matchingNodes":[{"id":"${node.id}"}],"matchingNodesCount":1}}
           |""".stripMargin))
    }

    "get total node and edge count" in {
      val nodeCount = KgTestData.nodes.size
      val edgeCount = KgTestData.edges.size
      val query =
        graphql"""
          query TotalCountsQuery {
            totalNodesCount
            totalEdgesCount
          }
        """

      executeQuery(query) must be(Json.parse(
        s"""{"data":{"totalNodesCount":${nodeCount},"totalEdgesCount":${edgeCount}}}"""
      ))
    }

    "get paths" in {
      val query =
        graphql"""
          query PathsQuery {
            paths {
              id
            }
          }
        """

      val result = Json.stringify(executeQuery(query))
      for (path <- KgTestData.paths) {
        result must include(path.id)
      }
    }

    "get path by id" in {
      val query =
        graphql"""
          query PathQuery($$id: String!) {
            pathById(id: $$id) {
                path
            }
          }
        """

      val path = KgTestData.paths(0)
      val result = Json.stringify(executeQuery(query, vars = Json.obj("id" -> path.id)))
      for (pathComponent <- path.path) {
        result must include(pathComponent)
      }
    }

    "get path edges and their nodes" in {
      val query =
        graphql"""
        query PathQuery($$id: String!) {
          pathById(id: $$id) {
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
      """

      val path = KgTestData.paths(0)
      val result = Json.stringify(executeQuery(query, vars = Json.obj("id" -> path.id)))
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
      userContext = new GraphQlSchemaContext(FakeRequest(), new TestKgStore())
    )
    Await.result(futureResult, 10.seconds)
  }
}
