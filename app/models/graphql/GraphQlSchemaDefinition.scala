package models.graphql

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.twxplore.lib.base.models.graphql.BaseGraphQlSchemaDefinition
import models.benchmark.{Benchmark, BenchmarkAnswer, BenchmarkAnswerExplanation, BenchmarkQuestion, BenchmarkQuestionAnswerPath, BenchmarkQuestionAnswerPaths, BenchmarkQuestionChoice, BenchmarkQuestionChoiceAnalysis, BenchmarkQuestionSet, BenchmarkSubmission}
import models.kg.{KgEdge, KgNode, KgPath}
import sangria.schema.{Argument, Field, FloatType, IntType, ListType, ObjectType, OptionInputType, OptionType, Schema, StringType, fields}
import sangria.macros.derive.{AddFields, deriveInputObjectType, deriveObjectType}
import sangria.marshalling.circe._
import stores.StringFilter
import stores.kg.KgNodeFilters

object GraphQlSchemaDefinition extends BaseGraphQlSchemaDefinition {
  // Scalar arguments
  val IdArgument = Argument("id", StringType)

  // Object types
  implicit val BenchmarkQuestionAnswerPath = deriveObjectType[GraphQlSchemaContext, BenchmarkQuestionAnswerPath]()
  implicit val BenchmarkQuestionAnswerPaths = deriveObjectType[GraphQlSchemaContext, BenchmarkQuestionAnswerPaths]()
  implicit val BenchmarkQuestionChoiceAnalysis = deriveObjectType[GraphQlSchemaContext, BenchmarkQuestionChoiceAnalysis]()
  implicit val BenchmarkAnswerExplanationType = deriveObjectType[GraphQlSchemaContext, BenchmarkAnswerExplanation]()
  implicit val BenchmarkAnswerType = deriveObjectType[GraphQlSchemaContext, BenchmarkAnswer]()
  implicit val BenchmarkSubmissionType = deriveObjectType[GraphQlSchemaContext, BenchmarkSubmission](
    AddFields(
      Field(
        "answerByQuestionId",
        OptionType(BenchmarkAnswerType),
        arguments = IdArgument :: Nil,
        resolve = ctx => ctx.ctx.stores.benchmarkStore.getBenchmarkAnswerByQuestion(
          benchmarkQuestionId = ctx.args.arg(IdArgument),
          benchmarkSubmissionId = ctx.value.id
        )
      ),
      Field(
        "answers",
        ListType(BenchmarkAnswerType),
        arguments = LimitArgument :: OffsetArgument :: Nil,
        resolve = ctx => ctx.ctx.stores.benchmarkStore.getBenchmarkAnswersBySubmission(
          benchmarkSubmissionId = ctx.value.id,
          limit = ctx.args.arg(LimitArgument),
          offset = ctx.args.arg(OffsetArgument)
        )
      )
    )
  )

  implicit val BenchmarkQuestionChoiceType = deriveObjectType[GraphQlSchemaContext, BenchmarkQuestionChoice]()
  implicit val BenchmarkQuestionType = deriveObjectType[GraphQlSchemaContext, BenchmarkQuestion]()
  implicit val BenchmarkQuestionSetType = deriveObjectType[GraphQlSchemaContext, BenchmarkQuestionSet](
    AddFields(
      Field(
        "questionById",
        OptionType(BenchmarkQuestionType),
        arguments = IdArgument :: Nil,
        resolve = ctx => ctx.ctx.stores.benchmarkStore.getBenchmarkQuestionById(ctx.args.arg(IdArgument))
      ),
      Field(
        "questions",
        ListType(BenchmarkQuestionType),
        arguments = LimitArgument :: OffsetArgument :: Nil,
        resolve = ctx => ctx.ctx.stores.benchmarkStore.getBenchmarkQuestionsBySet(
          benchmarkQuestionSetId = ctx.value.id,
          limit = ctx.args.arg(LimitArgument),
          offset = ctx.args.arg(OffsetArgument)
        )
      ),
      Field("submissions", ListType(BenchmarkSubmissionType), resolve = ctx => ctx.ctx.stores.benchmarkStore.getBenchmarkSubmissionsByQuestionSet(questionSetId = ctx.value.id))
    )
  )
  implicit val BenchmarkType = deriveObjectType[GraphQlSchemaContext, Benchmark](
    AddFields(
      Field("submissions", ListType(BenchmarkSubmissionType), resolve = ctx => ctx.ctx.stores.benchmarkStore.getBenchmarkSubmissionsByBenchmark(benchmarkId = ctx.value.id))
    )
  )

  // Can't use deriveObjectType for KgEdge and KgNode because we need to define them recursively
  // https://github.com/sangria-graphql/sangria/issues/54
  lazy val KgEdgeType: ObjectType[GraphQlSchemaContext, KgEdge] = ObjectType("KgEdge", () => fields[GraphQlSchemaContext, KgEdge](
    Field("datasource", StringType, resolve = _.value.datasource),
    Field("object", StringType, resolve = _.value.`object`),
    // Assume the edge is not dangling
    Field("objectNode", KgNodeType, resolve = ctx => ctx.ctx.stores.kgStore.getNodeById(ctx.value.`object`).head),
    Field("other", OptionType(StringType), resolve = _.value.other),
    Field("predicate", StringType, resolve = _.value.predicate),
    Field("subject", StringType, resolve = _.value.subject),
    // Assume the edge is not dangling
    Field("subjectNode", KgNodeType, resolve = ctx => ctx.ctx.stores.kgStore.getNodeById(ctx.value.subject).head),
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
    Field("matchingNodes", ListType(KgNodeType), arguments = KgNodeFiltersArgument :: LimitArgument :: OffsetArgument :: TextArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getMatchingNodes(filters = ctx.args.arg(KgNodeFiltersArgument), limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), text = ctx.args.arg(TextArgument))),
    Field("matchingNodesCount", IntType, arguments = KgNodeFiltersArgument :: TextArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getMatchingNodesCount(filters = ctx.args.arg(KgNodeFiltersArgument), text = ctx.args.arg(TextArgument))),
    Field("paths", ListType(KgPathType), resolve = ctx => ctx.ctx.stores.kgStore.getPaths),
    Field("pathById", OptionType(KgPathType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getPathById(ctx.args.arg(IdArgument))),
    Field("nodeById", OptionType(KgNodeType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.stores.kgStore.getNodeById(ctx.args.arg(IdArgument))),
    Field("randomNode", KgNodeType, resolve = ctx => ctx.ctx.stores.kgStore.getRandomNode),
    Field("totalEdgesCount", IntType, resolve = ctx => ctx.ctx.stores.kgStore.getTotalEdgesCount),
    Field("totalNodesCount", IntType, resolve = ctx => ctx.ctx.stores.kgStore.getTotalNodesCount)
  ))

  val RootQueryType = ObjectType("RootQuery",  fields[GraphQlSchemaContext, Unit](
    Field("benchmarks", ListType(BenchmarkType), resolve = _.ctx.stores.benchmarkStore.getBenchmarks),
    Field("benchmarkById", OptionType(BenchmarkType), arguments = IdArgument :: Nil,resolve = ctx => ctx.ctx.stores.benchmarkStore.getBenchmarkById(ctx.args.arg(IdArgument))),
    Field("kgById", KgQueryType, arguments = IdArgument :: Nil, resolve = _.args.arg(IdArgument))
  ))

  // Schema
  val schema = Schema(
    RootQueryType
  )
}
