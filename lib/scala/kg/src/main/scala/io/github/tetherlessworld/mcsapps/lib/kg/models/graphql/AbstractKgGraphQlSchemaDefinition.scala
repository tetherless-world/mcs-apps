package io.github.tetherlessworld.mcsapps.lib.kg.models.graphql

import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
import io.github.tetherlessworld.mcsapps.lib.kg.models.SortDirection
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.{KgEdge, KgPredicateLabelMapping}
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeContext, KgNodeLabel, KgNodeLabelContext}
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.search._
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.twxplore.lib.base.models.graphql.BaseGraphQlSchemaDefinition
import sangria.macros.derive.{AddFields, deriveInputObjectType, deriveObjectType}
import sangria.marshalling.circe._
import sangria.schema.{Argument, Field, FloatType, IntType, ListInputType, ListType, ObjectType, OptionInputType, OptionType, StringType, UnionType, fields}

abstract class AbstractKgGraphQlSchemaDefinition extends BaseGraphQlSchemaDefinition {
  // Scalar arguments
  val IdArgument = Argument("id", StringType)
  val LabelArgument = Argument("label", StringType)

  // Object types
  // KgSource
  implicit val KgSourceObjectType = deriveObjectType[KgGraphQlSchemaContext, KgSource]()

  private def mapSources(sourceIds: List[String], sourcesById: Map[String, KgSource]): List[KgSource] =
    sourceIds.map(sourceId => sourcesById.getOrElse(sourceId, KgSource(sourceId)))

  // Can't use deriveObjectType for KgEdge and KgNode because we need to define them recursively
  // https://github.com/sangria-graphql/sangria/issues/54

  // KgEdge
  implicit lazy val KgEdgeObjectType: ObjectType[KgGraphQlSchemaContext, KgEdge] = ObjectType("KgEdge", () => fields[KgGraphQlSchemaContext, KgEdge](
    Field("id", StringType, resolve = _.value.id),
    Field("labels", ListType(StringType), resolve = ctx => ctx.value.labels),
    Field("object", StringType, resolve = _.value.`object`),
    Field("objectNode", OptionType(KgNodeObjectType), resolve = ctx => ctx.ctx.kgQueryStore.getNode(ctx.value.`object`)),
    Field("predicate", StringType, resolve = _.value.predicate),
    Field("sourceIds", ListType(StringType), resolve = _.value.sourceIds),
    Field("sources", ListType(KgSourceObjectType), resolve = ctx => mapSources(ctx.value.sourceIds, ctx.ctx.kgQueryStore.getSourcesById)),
    Field("subject", StringType, resolve = _.value.subject),
    Field("subjectNode", OptionType(KgNodeObjectType), resolve = ctx => ctx.ctx.kgQueryStore.getNode(ctx.value.subject)),
  ))
  // KgNode
  implicit lazy val KgNodeObjectType: ObjectType[KgGraphQlSchemaContext, KgNode] = ObjectType("KgNode", () => fields[KgGraphQlSchemaContext, KgNode](
    Field("context", KgNodeContextObjectType, resolve = ctx => ctx.ctx.kgQueryStore.getNodeContext(ctx.value.id).get),
    Field("id", StringType, resolve = _.value.id),
    Field("labels", ListType(StringType), resolve = _.value.labels),
    Field("pageRank", FloatType, resolve = _.value.pageRank.get),
    Field("pos", OptionType(StringType), resolve = _.value.pos.map(_.toString)),
    Field("sourceIds", ListType(StringType), resolve = _.value.sourceIds),
    Field("sources", ListType(KgSourceObjectType), resolve = ctx => mapSources(ctx.value.sourceIds, ctx.ctx.kgQueryStore.getSourcesById)),
    Field("wordNetSenseNumber", OptionType(IntType), resolve = _.value.wordNetSenseNumber),
  ))
  // KgPredicateLabelMappingObjectType
  implicit val KgPredicateLabelMappingObjectType = deriveObjectType[KgGraphQlSchemaContext, KgPredicateLabelMapping]()
  // KgNodeContext
  implicit lazy val KgNodeContextObjectType: ObjectType[KgGraphQlSchemaContext, KgNodeContext] = ObjectType("KgNodeContext", () => fields[KgGraphQlSchemaContext, KgNodeContext](
    Field("predicateLabelMappings", ListType(KgPredicateLabelMappingObjectType), resolve = _.value.predicateLabelMappings),
    Field("relatedNodeLabels", ListType(KgNodeLabelObjectType), resolve = _.value.relatedNodeLabels),
    Field("topEdges", ListType(KgEdgeObjectType), resolve = _.value.topEdges)
  ))
  // KgNodeLabel
  implicit lazy val KgNodeLabelObjectType: ObjectType[KgGraphQlSchemaContext, KgNodeLabel] = ObjectType("KgNodeLabel", () => fields[KgGraphQlSchemaContext, KgNodeLabel](
    Field("context", KgNodeLabelContextObjectType, resolve = ctx => ctx.ctx.kgQueryStore.getNodeLabelContext(ctx.value.nodeLabel).get),
    Field("nodeLabel", StringType, resolve = _.value.nodeLabel),
//    Field("nodeCount", IntType, resolve = _.value.nodes.size),
    Field("nodeIds", ListType(StringType), resolve = _.value.nodes.map(_.id)),
    Field("nodes", ListType(KgNodeObjectType), resolve = _.value.nodes),
    Field("pageRank", FloatType, resolve = _.value.pageRank.get),
    Field("sourceIds", ListType(StringType), resolve = _.value.sourceIds)
  ))
  // KgNodeLabelContext
  implicit lazy val KgNodeLabelContextObjectType: ObjectType[KgGraphQlSchemaContext, KgNodeLabelContext] = ObjectType("KgNodeLabelContext", () => fields[KgGraphQlSchemaContext, KgNodeLabelContext](
    Field("predicateLabelMappings", ListType(KgPredicateLabelMappingObjectType), resolve = _.value.predicateLabelMappings),
    Field("relatedNodeLabels", ListType(KgNodeLabelObjectType), resolve = _.value.relatedNodeLabels),
    Field("topEdges", ListType(KgEdgeObjectType), resolve = _.value.topEdges)
  ))

  // KgPath
  val KgPathObjectType = deriveObjectType[KgGraphQlSchemaContext, KgPath](
    AddFields(
      Field("edges", ListType(KgEdgeObjectType), resolve = _.value.edges)
    )
  )
  // Search
  implicit val KgSearchResultTypeEnumType = KgSearchResultType.sangriaType
  implicit val KgSearchResultTypeFacetObjectType = deriveObjectType[KgGraphQlSchemaContext, KgSearchResultTypeFacet]()
  implicit val StringFacetObjectType = deriveObjectType[KgGraphQlSchemaContext, StringFacet]()
  val KgSearchFacetsObjectType = deriveObjectType[KgGraphQlSchemaContext, KgSearchFacets]()
  implicit val KgEdgeSearchResultObjectType = deriveObjectType[KgGraphQlSchemaContext, KgEdgeSearchResult]()
  implicit val KgEdgeLabelSearchResultObjectType = deriveObjectType[KgGraphQlSchemaContext, KgEdgeLabelSearchResult]()
  implicit val KgNodeLabelSearchResultObjectType = deriveObjectType[KgGraphQlSchemaContext, KgNodeLabelSearchResult]()
  implicit val KgNodeSearchResultObjectType = deriveObjectType[KgGraphQlSchemaContext, KgNodeSearchResult]()
  implicit val KgSourceSearchResultObjectType = deriveObjectType[KgGraphQlSchemaContext, KgSourceSearchResult]()
  val KgSearchResultUnionType = UnionType("KgSearchResult", types = List(KgEdgeSearchResultObjectType, KgEdgeLabelSearchResultObjectType, KgNodeLabelSearchResultObjectType, KgNodeSearchResultObjectType, KgSourceSearchResultObjectType))

  // Input enum types
  implicit val KgSearchSortFieldEnumType = KgSearchSortField.sangriaType
  implicit val SortDirectionEnumType = SortDirection.sangriaType

  // Input object decoders
  implicit val stringFilterDecoder: Decoder[StringFilter] = deriveDecoder
  implicit val kgSearchResultTypeFilterDecoder: Decoder[KgSearchResultTypeFilter] = deriveDecoder
  implicit val kgSearchFiltersDecoder: Decoder[KgSearchFilters] = deriveDecoder
  implicit val kgSearchQueryDecoder: Decoder[KgSearchQuery] = deriveDecoder
  implicit val kgSearchSortDecoder: Decoder[KgSearchSort] = deriveDecoder
  // Input object types
  implicit val StringFacetFilterInputObjectType = deriveInputObjectType[StringFilter]()
  implicit val KgSearchResultTypeFilterInputObjectType = deriveInputObjectType[KgSearchResultTypeFilter]()
  implicit val KgSearchFiltersInputObjectType = deriveInputObjectType[KgSearchFilters]()
  implicit val KgSearchQueryInputObjectType = deriveInputObjectType[KgSearchQuery]()
  implicit val KgSearchSortInputObjectType = deriveInputObjectType[KgSearchSort]()

  // Object argument types types
  val KgSearchQueryArgument = Argument("query", KgSearchQueryInputObjectType)
  val KgSearchSortsArgument = Argument("sorts", OptionInputType(ListInputType(KgSearchSortInputObjectType)))

  // Query types
  val KgQueryObjectType = ObjectType("Kg", fields[KgGraphQlSchemaContext, String](
    Field("search", ListType(KgSearchResultUnionType), arguments = LimitArgument :: OffsetArgument :: KgSearchQueryArgument :: KgSearchSortsArgument :: Nil, resolve = ctx => ctx.ctx.kgQueryStore.search(limit = ctx.args.arg(LimitArgument), offset = ctx.args.arg(OffsetArgument), query = ctx.args.arg(KgSearchQueryArgument), sorts = ctx.args.arg(KgSearchSortsArgument).map(_.toList))),
    Field("searchCount", IntType, arguments = KgSearchQueryArgument :: Nil, resolve = ctx => ctx.ctx.kgQueryStore.searchCount(query = ctx.args.arg(KgSearchQueryArgument))),
    Field("searchFacets", KgSearchFacetsObjectType, arguments = KgSearchQueryArgument :: Nil, resolve = ctx => ctx.ctx.kgQueryStore.searchFacets(query = ctx.args.arg(KgSearchQueryArgument))),
    Field("node", OptionType(KgNodeObjectType), arguments = IdArgument :: Nil, resolve = ctx => ctx.ctx.kgQueryStore.getNode(ctx.args.arg(IdArgument))),
    Field("nodeLabel", OptionType(KgNodeLabelObjectType), arguments = LabelArgument :: Nil, resolve = ctx => ctx.ctx.kgQueryStore.getNodeLabel(ctx.args.arg(LabelArgument))),
    Field("sources", ListType(KgSourceObjectType), resolve = ctx => ctx.ctx.kgQueryStore.getSources),
    Field("totalEdgesCount", IntType, resolve = ctx => ctx.ctx.kgQueryStore.getTotalEdgesCount),
    Field("totalNodesCount", IntType, resolve = ctx => ctx.ctx.kgQueryStore.getTotalNodesCount)
  ))
}
