package controllers.graphql

import akka.actor.ActorSystem
import io.github.tetherlessworld.twxplore.lib.base.controllers.graphql.BaseGraphQlController
import javax.inject.{Inject, Singleton}
import models.graphql.{BenchmarkGraphQlSchemaContext, BenchmarkGraphQlSchemaDefinition}
import play.api.mvc.Request
import stores.benchmark.BenchmarkStore
import stores.kg.KgStore

@Singleton
class BenchmarkGraphQlController @Inject()(benchmarkStore: BenchmarkStore, kgStore: KgStore, system: ActorSystem) extends BaseGraphQlController[BenchmarkGraphQlSchemaContext](BenchmarkGraphQlSchemaDefinition.schema, system) {
  override protected def getContext(request: Request[_]): BenchmarkGraphQlSchemaContext = new BenchmarkGraphQlSchemaContext(benchmarkStore, kgStore, request)
}
