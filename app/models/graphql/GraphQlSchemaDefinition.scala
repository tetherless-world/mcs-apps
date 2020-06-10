package models.graphql

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.twxplore.lib.base.models.graphql.BaseGraphQlSchemaDefinition
import models.cskg.{Edge, Node}
import models.path.Path
import sangria.schema.{Argument, Field, FloatType, IntType, ListType, ObjectType, OptionInputType, OptionType, Schema, StringType, fields}
import sangria.macros.derive.{AddFields, deriveInputObjectType, deriveObjectType}
import sangria.marshalling.circe._
import stores.{NodeFilters, StringFilter}

object GraphQlSchemaDefinition extends BaseGraphQlSchemaDefinition {
  // Object types
  // Can't use deriveObjectType because we need to define node and edge recursively
  // https://github.com/sangria-graphql/sangria/issues/54
  lazy val EdgeType: ObjectType[GraphQlSchemaContext, Edge] = ObjectType("Edge", () => fields[GraphQlSchemaContext, Edge](
    Field("datasource", StringType, resolve = _.value.datasource),
    Field("object", StringType, resolve = _.value.`object`),
    Field("objectNode", OptionType(NodeType), resolve = ctx => ctx.ctx.store.getNodeById(ctx.value.`object`)),
    Field("other", OptionType(StringType), resolve = _.value.other),
    Field("predicate", OptionType(StringType), resolve = _.value.predicate),
    Field("subject", StringType, resolve = _.value.subject),
    Field("subjectNode", OptionType(NodeType), resolve = ctx => ctx.ctx.store.getNodeById(ctx.value.subject)),
    Field("weight", OptionType(FloatType), resolve = _.value.weight)
  ))
  lazy val NodeType: ObjectType[GraphQlSchemaContext, Node] = ObjectType("Node", () => fields[GraphQlSchemaContext, Node](
    Field("aliases", OptionType(ListType(StringType)), resolve = _.value.aliases),
    Field("datasource", StringType, resolve = _.value.datasource),
    Field("id", StringType, resolve = _.value.id),
    Field("label", OptionType(StringType), resolve = _.value.label),
    Field("objectOfEdges", ListType(EdgeType), arguments = LimitArgument :: OffsetArgument :: Nil, resolve = ctx => ctx.ctx.store.getEdgesByObject(limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), objectNodeId = ctx.value.id)),
    Field("other", OptionType(StringType), resolve = _.value.other),
    Field("pos", OptionType(StringType), resolve = _.value.pos),
    Field("subjectOfEdges", ListType(EdgeType), arguments = LimitArgument :: OffsetArgument :: Nil, resolve = ctx => ctx.ctx.store.getEdgesBySubject(limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), subjectNodeId = ctx.value.id))
  ))
  val PathType = deriveObjectType[GraphQlSchemaContext, Path](
    AddFields(
      Field("edges", ListType(EdgeType), resolve = _.value.edges)
    )
  )

  // Input object decoders
  implicit val stringFilterDecoder: Decoder[StringFilter] = deriveDecoder
  implicit val nodeFiltersDecoder: Decoder[NodeFilters] = deriveDecoder
  // Input object types
  implicit val StringFilterType = deriveInputObjectType[StringFilter]()
  implicit val NodeFiltersType = deriveInputObjectType[NodeFilters]()

  // Argument types
  val IdArgument = Argument("id", StringType)
  val NodeFiltersArgument = Argument("filters", OptionInputType(NodeFiltersType))

  // Query types
  val RootQueryType = ObjectType("RootQuery",  fields[GraphQlSchemaContext, Unit](
    Field("datasources", ListType(StringType), resolve = ctx => ctx.ctx.store.getDatasources),
    Field("matchingNodes", ListType(NodeType), arguments = NodeFiltersArgument :: LimitArgument :: OffsetArgument :: TextArgument :: Nil, resolve = ctx => ctx.ctx.store.getMatchingNodes(filters = ctx.args.arg(NodeFiltersArgument), limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), text = ctx.args.arg(TextArgument))),
    Field("matchingNodesCount", IntType, arguments = NodeFiltersArgument :: TextArgument :: Nil, resolve = ctx => ctx.ctx.store.getMatchingNodesCount(filters = ctx.args.arg(NodeFiltersArgument), text = ctx.args.arg(TextArgument))),
    Field("paths", ListType(PathType), resolve = ctx => ctx.ctx.store.getPaths),
    Field("pathById", OptionType(PathType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.store.getPathById(ctx.args.arg(IdArgument))),
    Field("nodeById", OptionType(NodeType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.store.getNodeById(ctx.args.arg(IdArgument))),
    Field("randomNode", NodeType, resolve = ctx => ctx.ctx.store.getRandomNode),
    Field("totalEdgesCount", IntType, resolve = ctx => ctx.ctx.store.getTotalEdgesCount),
    Field("totalNodesCount", IntType, resolve = ctx => ctx.ctx.store.getTotalNodesCount)
  ))

  // Schema
  val schema = Schema(
    RootQueryType
  )
}
