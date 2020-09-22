package models.graphql

import io.github.tetherlessworld.mcsapps.lib.kg.models.graphql.{AbstractKgGraphQlSchemaDefinition, KgGraphQlSchemaContext}
import sangria.schema.{Field, ObjectType, Schema, fields}

object KgGraphQlSchemaDefinition extends AbstractKgGraphQlSchemaDefinition {
  val RootQueryObjectType = ObjectType("RootQuery",  fields[KgGraphQlSchemaContext, Unit](
    Field("kgById", KgQueryObjectType, arguments = IdArgument :: Nil, resolve = _.args.arg(IdArgument))
  ))

  // Schema
  val schema = Schema(
    RootQueryObjectType
  )
}
