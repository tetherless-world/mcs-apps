package io.github.tetherlessworld.mcsapps.lib.kg.stores

import com.google.inject.AbstractModule
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.benchmark.{BenchmarkStore, ConfBenchmarkStore, TestBenchmarkStore}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.neo4j.{Neo4jKgCommandStore, Neo4jKgQueryStore}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.kg.KgQueryStore
import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore

final class BenchmarkStoresModule(environment: Environment, configuration: Configuration) extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[BenchmarkStoresModule])

  override def configure(): Unit = {
    configuration.getOptional[String]("benchmarkStore").getOrElse("conf") match {
      case "test" => {
        logger.info("using test stores")
        bind(classOf[BenchmarkStore]).to(classOf[TestBenchmarkStore])
      }
      case _ => {
        bind(classOf[BenchmarkStore]).to(classOf[ConfBenchmarkStore])
      }
    }
  }
}
