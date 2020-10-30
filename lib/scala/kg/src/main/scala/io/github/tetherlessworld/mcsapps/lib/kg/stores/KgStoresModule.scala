package io.github.tetherlessworld.mcsapps.lib.kg.stores

import com.google.inject.AbstractModule
import io.github.tetherlessworld.mcsapps.lib.kg.stores.empty.EmptyKgStore
import io.github.tetherlessworld.mcsapps.lib.kg.stores.mem.MemKgStore
import io.github.tetherlessworld.mcsapps.lib.kg.stores.neo4j.{Neo4jKgCommandStore, Neo4jKgQueryStore}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres.{PostgresKgCommandStore, PostgresKgQueryStore}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}

final class KgStoresModule(environment: Environment, configuration: Configuration) extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[KgStoresModule])

  override def configure(): Unit = {
    val kgStoreName = configuration.getOptional[String]("kgStore").getOrElse("neo4j")
    kgStoreName match {
      case "empty" => {
        bind(classOf[KgCommandStore]).to(classOf[EmptyKgStore])
        bind(classOf[KgQueryStore]).to(classOf[EmptyKgStore])
      }
      case "mem" => {
        bind(classOf[KgCommandStore]).to(classOf[MemKgStore])
        bind(classOf[KgQueryStore]).to(classOf[MemKgStore])
      }
      case "postgres" => {
        bind(classOf[KgCommandStore]).to(classOf[PostgresKgCommandStore])
        bind(classOf[KgQueryStore]).to(classOf[PostgresKgQueryStore])
      }
      case "test" => {
        logger.info("using test stores")
        bind(classOf[KgCommandStore]).to(classOf[TestKgStore])
        bind(classOf[KgQueryStore]).to(classOf[TestKgStore])
      }
      case _ => {
        bind(classOf[KgCommandStore]).to(classOf[Neo4jKgCommandStore])
        bind(classOf[KgQueryStore]).to(classOf[Neo4jKgQueryStore])
      }
    }

    kgStoreName match {
      case "test" =>
      case _ =>
        bind(classOf[KgDataDirectoryLoader]).asEagerSingleton()
    }
  }
}
