package models.graphql

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.models.graphql.KgGraphQlSchemaContext
import org.scalatestplus.play.PlaySpec
import play.api.libs.json.{JsObject, Json}
import play.api.test.FakeRequest
import sangria.ast.Document
import sangria.execution.Executor
import sangria.macros._
import sangria.marshalling.playJson._
import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class KgGraphQlSchemaDefinitionSpec extends PlaySpec {
  private val KgId = "test"

  "GraphQL schema" must {
    "get a KG node by id" in {
      val node = TestKgData.nodes(0)
      val query =
        graphql"""
         query KgNodeByIdQuery($$kgId: String!, $$nodeId: String!) {
           kgById(id: $$kgId) {
             node(id: $$nodeId) {
              labels
             }
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "nodeId" -> node.id)))
      for (label <- node.labels) {
        result must include(label)
      }
    }

    "get a node's context" in {
      val node = TestKgData.nodes(0)
      val query =
        graphql"""
         query KgEdgesQuery($$kgId: String!, $$nodeId: String!) {
           kgById(id: $$kgId) {
             node(id: $$nodeId) {
               context {
                 topEdges {
                   predicate
                   object
                   objectNode {
                     labels
                   }
                 }
               }
             }
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "nodeId" -> node.id)))
      for (edge <- TestKgData.edges.filter(edge => edge.subject == node.id)) {
        result must include(s"""{"predicate":"${edge.predicate}","object":"${edge.`object`}"""")
      }
    }

    // Deprecated feature
//    "get top KG edges the node is an object of" in {
//      val node = TestKgData.nodes(0)
//      val query =
//        graphql"""
//         query KgEdgesQuery($$kgId: String!, $$nodeId: String!) {
//           kgById(id: $$kgId) {
//             nodeById(id: $$nodeId) {
//               topObjectOfEdges(limit: 10000) {
//                 predicate
//                 subject
//               }
//             }
//           }
//         }
//       """
//
//      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "nodeId" -> node.id)))
//      result must include("""{"data":{"kgById":{"nodeById":{"objectOfEdges":[{"predicate"""")
//    }

    "search KG labels" in {
      val label = TestKgData.nodeLabelsByLabel.keys.head
      val query =
        graphql"""
         query KgSourceSearchQuery($$kgId: String!, $$text: String!) {
           kgById(id: $$kgId) {
             search(query: {text: $$text}, limit: 10, offset: 0) {
                __typename
                  ... on KgNodeLabelSearchResult {
                    nodeLabel
                  }
             }
             searchCount(query: {text: $$text})
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "text" -> s"""label:"${label}"""")))

      result must include(label)
    }

    "search KG with a type filtering" in {
      val label = TestKgData.nodeLabelsByLabel.keys.head
      val query =
        graphql"""
         query KgSourceSearchQuery($$kgId: String!, $$text: String!) {
           kgById(id: $$kgId) {
             search(query: {filters: {types: {exclude: [Node]}}, text: $$text}, limit: 10, offset: 0) {
                __typename
                  ... on KgNodeLabelSearchResult {
                    nodeLabel
                  }
             }
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "text" -> s"""label:"${label}"""")))
      result must include(label)
    }

    "search KG nodes" in {
      val node = TestKgData.nodes(0)
      val query =
        graphql"""
         query KgNodeSearchQuery($$kgId: String!, $$text: String!) {
           kgById(id: $$kgId) {
             search(query: {text: $$text}, limit: 10, offset: 0) {
                __typename
                  ... on KgNodeSearchResult {
                    node {
                      id
                    }
                  }
             }
             searchCount(query: {text: $$text})
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId, "text" -> s"""labels:"${node.labels(0)}"""")))

      result must include(node.id)
    }

    "get KG node facets" in {
      val query =
        graphql"""
         query KgNodeFacetSearchQuery($$kgId: String!) {
           kgById(id: $$kgId) {
             searchFacets(query: {}) {
                sourceIds {
                  value
                }
             }
           }
         }
       """

      val result = Json.stringify(executeQuery(query, vars = Json.obj("kgId" -> KgId)))
      for (source <- TestKgData.sources) {
        result must include(source.id)
      }
    }

    "get total KG node and edge count" in {
      val nodeCount = TestKgData.nodes.size
      val edgeCount = TestKgData.edges.size
      val query =
        graphql"""
          query TotalKgCountsQuery($$kgId: String!) {
            kgById(id: $$kgId) {
              totalNodesCount
              totalEdgesCount
            }
          }
        """

      executeQuery(query, vars = Json.obj("kgId" -> KgId)) must be(Json.parse(
        s"""{"data":{"kgById":{"totalNodesCount":${nodeCount},"totalEdgesCount":${edgeCount}}}}"""
      ))
    }
  }

  def executeQuery(query: Document, vars: JsObject = Json.obj()) = {
    val futureResult = Executor.execute(KgGraphQlSchemaDefinition.schema, query,
      variables = vars,
      userContext = new KgGraphQlSchemaContext(new TestKgStore, FakeRequest())
    )
    Await.result(futureResult, 10.seconds)
  }
}
