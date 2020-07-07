package models.graphql

import sangria.schema.{Field, ObjectType, Schema, fields}

object KgGraphQlSchemaDefinition extends AbstractKgGraphQlSchemaDefinition {
  val RootQueryType = ObjectType("RootQuery",  fields[KgGraphQlSchemaContext, Unit](
    Field("kgById", KgQueryType, arguments = IdArgument :: Nil, resolve = _.args.arg(IdArgument))
  ))

  // Schema
  val schema = Schema(
    RootQueryType
  )
}
