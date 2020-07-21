package controllers.graphql

import akka.actor.ActorSystem
import io.github.tetherlessworld.twxplore.lib.base.controllers.graphql.BaseGraphQlController
import javax.inject.{Inject, Singleton}
import models.graphql.{KgGraphQlSchemaContext, KgGraphQlSchemaDefinition}
import play.api.mvc.Request
import stores.kg.KgStore

@Singleton
class KgGraphQlController @Inject()(kgStore: KgStore, system: ActorSystem) extends BaseGraphQlController[KgGraphQlSchemaContext](KgGraphQlSchemaDefinition.schema, system) {
  override protected def getContext(request: Request[_]): KgGraphQlSchemaContext = new KgGraphQlSchemaContext(kgStore, request)
}
