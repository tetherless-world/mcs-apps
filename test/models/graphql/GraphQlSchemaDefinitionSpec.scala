package models.graphql

import org.scalatestplus.play.PlaySpec
import play.api.libs.json.{JsObject, Json}
import play.api.test.FakeRequest
import sangria.ast.Document
import sangria.execution.Executor
import sangria.macros._
import sangria.marshalling.playJson._
import stores.{TestData, TestStore}

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class GraphQlSchemaDefinitionSpec extends PlaySpec {
  "GraphQL schema" must {
    "get a node by id" in {
      val node = TestData.nodes(0)
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
      val node = TestData.nodes(0)
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
      for (edge <- TestData.edges.filter(edge => edge.subject == node.id)) {
        result must include(s"""{"predicate":"${edge.predicate}","object":"${edge.`object`}"""")
      }
    }

    "get edges the node is an object of" in {
      val node = TestData.nodes(0)
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

      executeQuery(query, vars = Json.obj("nodeId" -> node.id)) must be(Json.parse(
        s"""
           |{"data":{"nodeById":{"objectOfEdges":[{"predicate":"/r/DerivedFrom","subject":"gui_test_data:689"},{"predicate":"/r/SymbolOf","subject":"gui_test_data:849"},{"predicate":"/r/HasPrerequisite","subject":"gui_test_data:543"},{"predicate":"/r/HasProperty","subject":"gui_test_data:616"},{"predicate":"/r/MannerOf","subject":"gui_test_data:145"},{"predicate":"/r/Desires","subject":"gui_test_data:216"},{"predicate":"/r/ObstructedBy","subject":"gui_test_data:886"},{"predicate":"/r/MadeOf","subject":"gui_test_data:864"},{"predicate":"/r/HasProperty","subject":"gui_test_data:579"},{"predicate":"/r/ObstructedBy","subject":"gui_test_data:838"},{"predicate":"/r/AtLocation","subject":"gui_test_data:50"},{"predicate":"/r/MotivatedByGoal","subject":"gui_test_data:228"},{"predicate":"/r/IsA","subject":"gui_test_data:181"},{"predicate":"/r/DerivedFrom","subject":"gui_test_data:809"},{"predicate":"/r/SimilarTo","subject":"gui_test_data:971"},{"predicate":"/r/ObstructedBy","subject":"gui_test_data:81"},{"predicate":"/r/Synonym","subject":"gui_test_data:836"},{"predicate":"/r/DerivedFrom","subject":"gui_test_data:62"},{"predicate":"/r/LocatedNear","subject":"gui_test_data:67"},{"predicate":"/r/ObstructedBy","subject":"gui_test_data:725"},{"predicate":"/r/MotivatedByGoal","subject":"gui_test_data:263"},{"predicate":"/r/HasLastSubevent","subject":"gui_test_data:83"},{"predicate":"/r/DerivedFrom","subject":"gui_test_data:524"},{"predicate":"/r/HasPrerequisite","subject":"gui_test_data:233"},{"predicate":"/r/FormOf","subject":"gui_test_data:81"},{"predicate":"/r/SymbolOf","subject":"gui_test_data:890"},{"predicate":"/r/Antonym","subject":"gui_test_data:836"},{"predicate":"/r/DefinedAs","subject":"gui_test_data:656"},{"predicate":"/r/Synonym","subject":"gui_test_data:325"},{"predicate":"/r/DistinctFrom","subject":"gui_test_data:991"},{"predicate":"/r/Desires","subject":"gui_test_data:595"},{"predicate":"/r/ReceivesAction","subject":"gui_test_data:174"},{"predicate":"/r/AtLocation","subject":"gui_test_data:252"},{"predicate":"/r/Causes","subject":"gui_test_data:364"},{"predicate":"/r/MannerOf","subject":"gui_test_data:128"},{"predicate":"/r/HasSubevent","subject":"gui_test_data:528"},{"predicate":"/r/ExternalURL","subject":"gui_test_data:189"},{"predicate":"/r/IsA","subject":"gui_test_data:17"},{"predicate":"/r/ObstructedBy","subject":"gui_test_data:26"},{"predicate":"/r/PartOf","subject":"gui_test_data:694"},{"predicate":"/r/DistinctFrom","subject":"gui_test_data:744"},{"predicate":"/r/HasSubevent","subject":"gui_test_data:316"},{"predicate":"/r/DerivedFrom","subject":"gui_test_data:866"},{"predicate":"/r/HasFirstSubevent","subject":"gui_test_data:517"},{"predicate":"/r/CreatedBy","subject":"gui_test_data:78"},{"predicate":"/r/HasSubevent","subject":"gui_test_data:434"}]}}}
           |""".stripMargin))
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
      val node = TestData.nodes(0)
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
      val nodeCount = TestData.nodes.size
      val edgeCount = TestData.edges.size
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
  }

  def executeQuery(query: Document, vars: JsObject = Json.obj()) = {
    val futureResult = Executor.execute(GraphQlSchemaDefinition.schema, query,
      variables = vars,
      userContext = new GraphQlSchemaContext(FakeRequest(), new TestStore())
    )
    Await.result(futureResult, 10.seconds)
  }
}
