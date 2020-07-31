package stores

import com.google.inject.AbstractModule
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}
import stores.kg.neo4j.Neo4jKgQueryStore
import stores.kg.{KgDataDirectoryLoader, KgQueryStore}
import stores.kg.test.TestKgStore

final class KgStoresModule(environment: Environment, configuration: Configuration) extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[KgStoresModule])

  override def configure(): Unit = {
    configuration.getOptional[String]("kgStore").getOrElse("neo4j") match {
      case "test" => {
        logger.info("using test stores")
        bind(classOf[KgQueryStore]).to(classOf[TestKgStore])
      }
      case _ => {
        bind(classOf[KgQueryStore]).to(classOf[Neo4jKgQueryStore])
        bind(classOf[KgDataDirectoryLoader]).asEagerSingleton()
      }
    }
  }
}
