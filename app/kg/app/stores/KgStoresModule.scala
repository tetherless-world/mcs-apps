package stores

import com.google.inject.AbstractModule
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}
import stores.kg.neo4j.Neo4jKgStore
import stores.kg.{KgDataDirectoryLoader, KgStore}
import stores.kg.test.TestKgStore

final class KgStoresModule(environment: Environment, configuration: Configuration) extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[KgStoresModule])

  override def configure(): Unit = {
    configuration.getOptional[String]("kgStore").getOrElse("neo4j") match {
      case "test" => {
        logger.info("using test stores")
        bind(classOf[KgStore]).to(classOf[TestKgStore])
      }
      case _ => {
        bind(classOf[KgStore]).to(classOf[Neo4jKgStore])
        bind(classOf[KgDataDirectoryLoader]).asEagerSingleton()
      }
    }
  }
}
