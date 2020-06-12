package models.graphql

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.twxplore.lib.base.models.graphql.BaseGraphQlSchemaDefinition
import models.kg.{KgEdge, KgNode, KgPath}
import sangria.schema.{Argument, Field, FloatType, IntType, ListType, ObjectType, OptionInputType, OptionType, Schema, StringType, fields}
import sangria.macros.derive.{AddFields, deriveInputObjectType, deriveObjectType}
import sangria.marshalling.circe._
import stores.StringFilter
import stores.kg.KgNodeFilters

object GraphQlSchemaDefinition extends BaseGraphQlSchemaDefinition {
  // Object types
  // Can't use deriveObjectType because we need to define node and edge recursively
  // https://github.com/sangria-graphql/sangria/issues/54
  lazy val KgEdgeType: ObjectType[GraphQlSchemaContext, KgEdge] = ObjectType("KgEdge", () => fields[GraphQlSchemaContext, KgEdge](
    Field("datasource", StringType, resolve = _.value.datasource),
    Field("object", StringType, resolve = _.value.`object`),
    // Assume the edge is not dangling
    Field("objectNode", KgNodeType, resolve = ctx => ctx.ctx.store.getNodeById(ctx.value.`object`).head),
    Field("other", OptionType(StringType), resolve = _.value.other),
    Field("predicate", StringType, resolve = _.value.predicate),
    Field("subject", StringType, resolve = _.value.subject),
    // Assume the edge is not dangling
    Field("subjectNode", KgNodeType, resolve = ctx => ctx.ctx.store.getNodeById(ctx.value.subject).head),
    Field("weight", OptionType(FloatType), resolve = _.value.weight)
  ))
  lazy val KgNodeType: ObjectType[GraphQlSchemaContext, KgNode] = ObjectType("Node", () => fields[GraphQlSchemaContext, KgNode](
    Field("aliases", OptionType(ListType(StringType)), resolve = _.value.aliases),
    Field("datasource", StringType, resolve = _.value.datasource),
    Field("id", StringType, resolve = _.value.id),
    Field("label", OptionType(StringType), resolve = _.value.label),
    Field("objectOfEdges", ListType(KgEdgeType), arguments = LimitArgument :: OffsetArgument :: Nil, resolve = ctx => ctx.ctx.store.getEdgesByObject(limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), objectNodeId = ctx.value.id)),
    Field("other", OptionType(StringType), resolve = _.value.other),
    Field("pos", OptionType(StringType), resolve = _.value.pos),
    Field("subjectOfEdges", ListType(KgEdgeType), arguments = LimitArgument :: OffsetArgument :: Nil, resolve = ctx => ctx.ctx.store.getEdgesBySubject(limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), subjectNodeId = ctx.value.id))
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

  // Argument types
  val IdArgument = Argument("id", StringType)
  val KgNodeFiltersArgument = Argument("filters", OptionInputType(KgNodeFiltersType))

  // Query types
  val KgQueryType = ObjectType("Kg", fields[GraphQlSchemaContext, String](
    Field("datasources", ListType(StringType), resolve = ctx => ctx.ctx.store.getDatasources),
    Field("matchingNodes", ListType(KgNodeType), arguments = KgNodeFiltersArgument :: LimitArgument :: OffsetArgument :: TextArgument :: Nil, resolve = ctx => ctx.ctx.store.getMatchingNodes(filters = ctx.args.arg(KgNodeFiltersArgument), limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), text = ctx.args.arg(TextArgument))),
    Field("matchingNodesCount", IntType, arguments = KgNodeFiltersArgument :: TextArgument :: Nil, resolve = ctx => ctx.ctx.store.getMatchingNodesCount(filters = ctx.args.arg(KgNodeFiltersArgument), text = ctx.args.arg(TextArgument))),
    Field("paths", ListType(KgPathType), resolve = ctx => ctx.ctx.store.getPaths),
    Field("pathById", OptionType(KgPathType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.store.getPathById(ctx.args.arg(IdArgument))),
    Field("nodeById", OptionType(KgNodeType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.store.getNodeById(ctx.args.arg(IdArgument))),
    Field("randomNode", KgNodeType, resolve = ctx => ctx.ctx.store.getRandomNode),
    Field("totalEdgesCount", IntType, resolve = ctx => ctx.ctx.store.getTotalEdgesCount),
    Field("totalNodesCount", IntType, resolve = ctx => ctx.ctx.store.getTotalNodesCount)
  ))

  val RootQueryType = ObjectType("RootQuery",  fields[GraphQlSchemaContext, Unit](
    Field("kg", KgQueryType, arguments = IdArgument :: Nil, resolve = _.args.arg(IdArgument))
  ))

  // Schema
  val schema = Schema(
    RootQueryType
  )
}
