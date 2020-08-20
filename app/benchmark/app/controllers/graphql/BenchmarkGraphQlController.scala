package controllers.graphql

import akka.actor.ActorSystem
import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgQueryStore
import io.github.tetherlessworld.twxplore.lib.base.controllers.graphql.BaseGraphQlController
import javax.inject.{Inject, Singleton}
import play.api.mvc.Request
import io.github.tetherlessworld.mcsapps.lib.kg.stores.benchmark.BenchmarkStore

@Singleton
class BenchmarkGraphQlController @Inject()(benchmarkStore: BenchmarkStore, kgQueryStore: KgQueryStore, system: ActorSystem) extends BaseGraphQlController[BenchmarkGraphQlSchemaContext](BenchmarkGraphQlSchemaDefinition.schema, system) {
  override protected def getContext(request: Request[_]): BenchmarkGraphQlSchemaContext = new BenchmarkGraphQlSchemaContext(benchmarkStore, kgQueryStore, request)
}
