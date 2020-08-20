package controllers.graphql

import akka.actor.ActorSystem
import io.github.tetherlessworld.mcsapps.lib.kg.models.graphql.KgGraphQlSchemaContext
import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgQueryStore
import io.github.tetherlessworld.twxplore.lib.base.controllers.graphql.BaseGraphQlController
import javax.inject.{Inject, Singleton}
import models.graphql.KgGraphQlSchemaDefinition
import play.api.mvc.Request

@Singleton
class KgGraphQlController @Inject()(kgQueryStore: KgQueryStore, system: ActorSystem) extends BaseGraphQlController[KgGraphQlSchemaContext](KgGraphQlSchemaDefinition.schema, system) {
  override protected def getContext(request: Request[_]): KgGraphQlSchemaContext = new KgGraphQlSchemaContext(kgQueryStore, request)
}
