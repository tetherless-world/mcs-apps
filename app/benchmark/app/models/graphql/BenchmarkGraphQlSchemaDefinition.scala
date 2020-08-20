package models.graphql

import io.github.tetherlessworld.mcsapps.lib.kg.models.graphql.AbstractKgGraphQlSchemaDefinition
import models.benchmark._
import sangria.macros.derive.{AddFields, deriveObjectType}
import sangria.schema.{Field, IntType, ListType, ObjectType, OptionType, Schema, fields}

object BenchmarkGraphQlSchemaDefinition extends AbstractKgGraphQlSchemaDefinition {
  implicit val BenchmarkQuestionAnswerPath = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkQuestionAnswerPath](
    AddFields(
      Field("edges", ListType(KgEdgeType), resolve = _.value.edges)
    )
  )
  implicit val BenchmarkQuestionAnswerPaths = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkQuestionAnswerPaths](
    AddFields(
      Field("endNode", OptionType(KgNodeType), resolve = ctx => ctx.ctx.kgQueryStore.getNodeById(ctx.value.endNodeId)),
      Field("startNode", OptionType(KgNodeType), resolve = ctx => ctx.ctx.kgQueryStore.getNodeById(ctx.value.startNodeId)),
    )
  )
  implicit val BenchmarkQuestionChoiceAnalysis = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkQuestionChoiceAnalysis]()
  implicit val BenchmarkAnswerExplanationType = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkAnswerExplanation]()
  implicit val BenchmarkAnswerType = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkAnswer]()
  implicit val BenchmarkSubmissionType = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkSubmission](
    AddFields(
      Field(
        "answerByQuestionId",
        OptionType(BenchmarkAnswerType),
        arguments = IdArgument :: Nil,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkAnswerByQuestion(
          benchmarkQuestionId = ctx.args.arg(IdArgument),
          benchmarkSubmissionId = ctx.value.id
        )
      ),
      Field(
        "answers",
        ListType(BenchmarkAnswerType),
        arguments = LimitArgument :: OffsetArgument :: Nil,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkAnswersBySubmission(
          benchmarkSubmissionId = ctx.value.id,
          limit = ctx.args.arg(LimitArgument),
          offset = ctx.args.arg(OffsetArgument)
        )
      )
    )
  )

  implicit val BenchmarkQuestionChoiceTypeType = models.benchmark.BenchmarkQuestionChoiceType.sangriaType
  implicit val BenchmarkQuestionChoiceType = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkQuestionChoice]()
  implicit val BenchmarkQuestionPromptTypeType = models.benchmark.BenchmarkQuestionPromptType.sangriaType
  implicit val BenchmarkQuestionPromptType = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkQuestionPrompt]()
  implicit val BenchmarkQuestionTypeType = models.benchmark.BenchmarkQuestionType.sangriaType
  implicit val BenchmarkQuestionType = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkQuestion](
    AddFields(
      Field(
        "answerBySubmissionId",
        OptionType(BenchmarkAnswerType),
        arguments = IdArgument :: Nil,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkAnswerByQuestion(benchmarkQuestionId = ctx.value.id, benchmarkSubmissionId = ctx.args.arg(IdArgument))
      ),
      Field(
        "answers",
        ListType(BenchmarkAnswerType),
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkAnswersByQuestion(benchmarkQuestionId = ctx.value.id)
      )
    )
  )
  implicit val BenchmarkDatasetType = deriveObjectType[BenchmarkGraphQlSchemaContext, BenchmarkDataset](
    AddFields(
      Field(
        "questionById",
        OptionType(BenchmarkQuestionType),
        arguments = IdArgument :: Nil,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkQuestionById(ctx.args.arg(IdArgument))
      ),
      Field(
        "questions",
        ListType(BenchmarkQuestionType),
        arguments = LimitArgument :: OffsetArgument :: Nil,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkQuestionsByDataset(
          benchmarkDatasetId = ctx.value.id,
          limit = ctx.args.arg(LimitArgument),
          offset = ctx.args.arg(OffsetArgument)
        )
      ),
      Field(
        "questionsCount",
        IntType,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkQuestionsCountByDataset(benchmarkDatasetId = ctx.value.id)
      ),
      Field(
        "submissionById",
        OptionType(BenchmarkSubmissionType),
        arguments = IdArgument :: Nil,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkSubmissionById(ctx.args.arg(IdArgument))
      ),
      Field("submissions", ListType(BenchmarkSubmissionType), resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkSubmissionsByDataset(benchmarkDatasetId = ctx.value.id)),
      Field("submissionsCount", IntType, resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkSubmissionsCountByDataset(benchmarkDatasetId = ctx.value.id))
    )
  )
  implicit val BenchmarkType = deriveObjectType[BenchmarkGraphQlSchemaContext, Benchmark](
    AddFields(
      Field(
        "datasetById",
        OptionType(BenchmarkDatasetType),
        arguments = IdArgument :: Nil,
        resolve = ctx => {
          val datasetId = ctx.args.arg(IdArgument)
          ctx.value.datasets.find(dataset => dataset.id == datasetId)
        }
      ),
      Field(
        "submissionById",
        OptionType(BenchmarkSubmissionType),
        arguments = IdArgument :: Nil,
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkSubmissionById(ctx.args.arg(IdArgument))
      ),
      Field(
        "submissions",
        ListType(BenchmarkSubmissionType),
        resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkSubmissionsByBenchmark(benchmarkId = ctx.value.id)
      ),
      Field("submissionsCount", IntType, resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkSubmissionsCountByBenchmark(benchmarkId = ctx.value.id))
    )
  )

  val RootQueryType = ObjectType("RootQuery",  fields[BenchmarkGraphQlSchemaContext, Unit](
    Field("benchmarks", ListType(BenchmarkType), resolve = _.ctx.benchmarkStore.getBenchmarks),
    Field("benchmarkById", OptionType(BenchmarkType), arguments = IdArgument :: Nil,resolve = ctx => ctx.ctx.benchmarkStore.getBenchmarkById(ctx.args.arg(IdArgument))),
    Field("kgById", KgQueryType, arguments = IdArgument :: Nil, resolve = _.args.arg(IdArgument))
  ))

  // Schema
  val schema = Schema(
    RootQueryType
  )
}
