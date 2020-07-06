package models.graphql

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.twxplore.lib.base.models.graphql.BaseGraphQlSchemaDefinition
import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkAnswerExplanation, BenchmarkDataset, BenchmarkQuestion, BenchmarkQuestionAnswerPath, BenchmarkQuestionAnswerPaths, BenchmarkQuestionChoice, BenchmarkQuestionChoiceAnalysis, BenchmarkQuestionChoiceType, BenchmarkQuestionPrompt, BenchmarkSubmission}
import models.kg.{KgEdge, KgNode, KgPath}
import sangria.schema.{Argument, Field, FloatType, IntType, ListType, ObjectType, OptionInputType, OptionType, Schema, StringType, fields}
import sangria.macros.derive.{AddFields, deriveEnumType, deriveInputObjectType, deriveObjectType}
import sangria.marshalling.circe._
import stores.StringFilter
import stores.kg.KgNodeFilters

object GraphQlSchemaDefinition extends BaseGraphQlSchemaDefinition {
  // Scalar arguments
  val IdArgument = Argument("id", StringType)
  val OptionalTextArgument = Argument("text", OptionInputType(StringType))


  // Object types
  // Can't use deriveObjectType for KgEdge and KgNode because we need to define them recursively
  // https://github.com/sangria-graphql/sangria/issues/54
  lazy val KgEdgeType: ObjectType[GraphQlSchemaContext, KgEdge] = ObjectType("KgEdge", () => fields[GraphQlSchemaContext, KgEdge](
    Field("datasource", StringType, resolve = _.value.datasource),
    Field("object", StringType, resolve = _.value.`object`),
    // Assume the edge is not dangling
    Field("objectNode", OptionType(KgNodeType), resolve = ctx => ctx.ctx.stores.kgStore.getNodeById(ctx.value.`object`)),
    Field("other", OptionType(StringType), resolve = _.value.other),
    Field("predicate", StringType, resolve = _.value.predicate),
    Field("subject", StringType, resolve = _.value.subject),
    // Assume the edge is not dangling
    Field("subjectNode", OptionType(KgNodeType), resolve = ctx => ctx.ctx.stores.kgStore.getNodeById(ctx.value.subject)),
    Field("weight", OptionType(FloatType), resolve = _.value.weight)
  ))
  lazy val KgNodeType: ObjectType[GraphQlSchemaContext, KgNode] = ObjectType("KgNode", () => fields[GraphQlSchemaContext, KgNode](
    Field("aliases", OptionType(ListType(StringType)), resolve = _.value.aliases),
    Field("datasource", StringType, resolve = _.value.datasource),
    Field("id", StringType, resolve = _.value.id),
    Field("label", OptionType(StringType), resolve = _.value.label),
    Field("objectOfEdges", ListType(KgEdgeType), arguments = LimitArgument :: OffsetArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getEdgesByObject(limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), objectNodeId = ctx.value.id)),
    Field("other", OptionType(StringType), resolve = _.value.other),
    Field("pos", OptionType(StringType), resolve = _.value.pos),
    Field("subjectOfEdges", ListType(KgEdgeType), arguments = LimitArgument :: OffsetArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getEdgesBySubject(limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), subjectNodeId = ctx.value.id))
  ))
  val KgPathType = deriveObjectType[GraphQlSchemaContext, KgPath](
    AddFields(
      Field("edges", ListType(KgEdgeType), resolve = _.value.edges)
    )
  )

  // Input object decoders
  implicit val stringFilterDecoder: Decoder[StringFilter] = deriveDecoder
  implicit val kgNodeFiltersDecoder: Decoder[KgNodeFilters] = deriveDecoder
  // Input object types
  implicit val StringFilterType = deriveInputObjectType[StringFilter]()
  implicit val KgNodeFiltersType = deriveInputObjectType[KgNodeFilters]()

  // Object argument types types
  val KgNodeFiltersArgument = Argument("filters", OptionInputType(KgNodeFiltersType))

  // Query types
  val KgQueryType = ObjectType("Kg", fields[GraphQlSchemaContext, String](
    Field("datasources", ListType(StringType), resolve = ctx => ctx.ctx.stores.kgStore.getDatasources),
    Field("matchingNodes", ListType(KgNodeType), arguments = KgNodeFiltersArgument :: LimitArgument :: OffsetArgument :: OptionalTextArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getMatchingNodes(filters = ctx.args.arg(KgNodeFiltersArgument), limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), text = ctx.args.arg(OptionalTextArgument))),
    Field("matchingNodesCount", IntType, arguments = KgNodeFiltersArgument :: OptionalTextArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getMatchingNodesCount(filters = ctx.args.arg(KgNodeFiltersArgument), text = ctx.args.arg(OptionalTextArgument))),
    Field("pathById", OptionType(KgPathType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getPathById(ctx.args.arg(IdArgument))),
    Field("nodeById", OptionType(KgNodeType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getNodeById(ctx.args.arg(IdArgument))),
    Field("randomNode", KgNodeType, resolve = ctx => ctx.ctx.stores.kgStore.getRandomNode),
    Field("totalEdgesCount", IntType, resolve = ctx => ctx.ctx.stores.kgStore.getTotalEdgesCount),
    Field("totalNodesCount", IntType, resolve = ctx => ctx.ctx.stores.kgStore.getTotalNodesCount)
  ))

  val RootQueryType = ObjectType("RootQuery",  fields[GraphQlSchemaContext, Unit](
    Field("kgById", KgQueryType, arguments = IdArgument :: Nil, resolve = _.args.arg(IdArgument))
  ))

  // Schema
  val schema = Schema(
    RootQueryType
  )
}
