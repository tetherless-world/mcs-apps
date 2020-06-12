package controllers.graphql

import akka.actor.ActorSystem
import io.github.tetherlessworld.twxplore.lib.base.controllers.graphql.BaseGraphQlController
import javax.inject.{Inject, Singleton}
import models.graphql.{GraphQlSchemaContext, GraphQlSchemaDefinition}
import play.api.mvc.Request
import stores.kg.KgStore

@Singleton
class GraphQlController @Inject()(store: KgStore, system: ActorSystem) extends BaseGraphQlController[GraphQlSchemaContext](GraphQlSchemaDefinition.schema, system) {
  override protected def getContext(request: Request[_]): GraphQlSchemaContext = new GraphQlSchemaContext(request, store)
}
